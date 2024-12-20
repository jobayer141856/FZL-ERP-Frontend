import { useRHF } from '@/hooks';
import {
	useDeliveryChallan,
	useDeliveryChallanDetailsByUUID,
	useDeliveryChallanEntry,
	useDeliveryPackingList,
	useDeliveryPackingListEntryByPackingListUUID,
} from '@/state/Delivery';
import {
	useOtherChallan,
	useOtherPackingListByOrderInfoUUIDAndChallanUUID,
} from '@/state/Other';
import { useAuth } from '@context/auth';
import { DevTool } from '@hookform/devtools';
import { Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DeleteModal, UpdateModal } from '@/components/Modal';
import { DynamicDeliveryField, LinkWithCopy } from '@/ui';
import SubmitButton from '@/ui/Others/Button/SubmitButton';

import cn from '@/lib/cn';
import nanoid from '@/lib/nanoid';
import GetDateTime from '@/util/GetDateTime';
import { CHALLAN_NULL, CHALLAN_SCHEMA } from '@util/Schema';

import Header from './Header';

export default function Index() {
	const { uuid } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const {
		url: deliveryChallanUrl,
		postData,
		updateData,
		invalidateQuery: invalidateChallan,
	} = useDeliveryChallan();
	const { url: deliveryChallanEntryUrl, deleteData: deleteChallanEntry } =
		useDeliveryChallanEntry();

	const { data: challan, invalidateQuery: invalidateDetails } =
		useDeliveryChallanDetailsByUUID(uuid);
	const { invalidateQuery: invalidateDeliveryPackingList } =
		useDeliveryPackingList();
	const isUpdate = uuid !== undefined;

	const { invalidateQuery: invalidateOtherChallan } =
		useOtherChallan('gate_pass=false');
	const {
		register,
		handleSubmit,
		errors,
		reset,
		control,
		Controller,
		useFieldArray,
		getValues,
		watch,
		setValue,
	} = useRHF(CHALLAN_SCHEMA, CHALLAN_NULL);
	// const { invalidateQuery: invalidatePackingList } = isUpdate
	// 	? useOtherPackingListByOrderInfoUUIDAndChallanUUID(
	// 			watch('order_info_uuid'),
	// 			watch('uuid')
	// 		)
	// 	: useOtherPackingListByOrderInfoUUID(watch('order_info_uuid'));
	useEffect(() => {
		if (challan && isUpdate) {
			reset({
				...challan,
				new_packing_list_uuids: [],
			});
		}
	}, [challan, isUpdate]);

	const { data: packingListEntry } =
		useDeliveryPackingListEntryByPackingListUUID(
			watch(isUpdate ? 'new_packing_list_uuids' : 'packing_list_uuids')
		);

	useEffect(() => {
		if (!isUpdate && packingListEntry?.packing_list_entry) {
			setValue('challan_entry', packingListEntry?.packing_list_entry);
		}
	}, [packingListEntry, isUpdate]);

	useEffect(() => {
		if (isUpdate && watch('new_packing_list_uuids')?.length === 0) {
			setValue('new_challan_entry', []);
			setValue('challan_entry', challan?.challan_entry);
		} else if (isUpdate && packingListEntry?.packing_list_entry) {
			setValue('new_challan_entry', packingListEntry?.packing_list_entry);
			setValue('challan_entry', challan?.challan_entry);
		}
	}, [packingListEntry, isUpdate, watch('new_packing_list_uuids')]);

	// challan_entry
	const { fields: challanEntryField } = useFieldArray({
		control,
		name: 'challan_entry',
	});

	// new challan_entry
	const { fields: newChallanEntryField } = useFieldArray({
		control,
		name: 'new_challan_entry',
	});

	const [deleteItem, setDeleteItem] = useState({
		itemId: null,
		itemName: null,
		challan_uuid: null,
	});
	// const [updateItem, setUpdateItem] = useState({
	// 	itemId: null,
	// 	itemName: null,
	// });
	// const handleRecipeRemove = (index) => {
	// 	const recipeUuid = getValues(`packing_list_uuids[${index}]`);
	// 	if (recipeUuid !== undefined) {
	// 		setUpdateItem({
	// 			itemId: recipeUuid,
	// 			itemName: recipeUuid,
	// 		});
	// 		window['delete_challan_packing_list'].showModal();
	// 	}
	// 	recipeRemove(index);
	// };

	// Submit
	const onSubmit = async (data) => {
		// Update item

		if (isUpdate) {
			const challanData = {
				...data,
				updated_at: GetDateTime(),
				receive_status: data.receive_status === true ? 1 : 0,
				carton_quantity:
					data?.challan_entry?.length +
					data?.new_challan_entry?.length,
				gate_pass: data.gate_pass === true ? 1 : 0,
			};

			// update /packing/list/uuid
			const challanPromise = await updateData.mutateAsync({
				url: `${deliveryChallanUrl}/${data?.uuid}`,
				updatedData: challanData,
				uuid: data.uuid,
				isOnCloseNeeded: false,
			});

			const updatedId = challanPromise?.data?.[0]?.updatedUuid;

			// update challan_entry
			const updatableChallanEntryPromises = data.new_challan_entry.map(
				async (item) => {
					const updatedData = {
						challan_uuid: data?.uuid,
					};

					return await updateData.mutateAsync({
						url: `${deliveryChallanEntryUrl}/${
							item?.packing_list_uuid
						}`,
						updatedData: updatedData,
						uuid: item.uuid,
						isOnCloseNeeded: false,
					});
				}
			);

			//new challan_entry
			// const newChallanEntryPromises = data?.new_challan_entry?.map(
			// 	async (item) => {
			// 		const data = {
			// 			...item,
			// 			uuid: nanoid(),
			// 			challan_uuid: uuid,
			// 			created_at: GetDateTime(),
			// 			remarks: item?.remarks,
			// 		};

			// 		return await postData.mutateAsync({
			// 			url: deliveryChallanEntryUrl,
			// 			newData: data,
			// 			isOnCloseNeeded: false,
			// 		});
			// 	}
			// );

			try {
				await Promise.all([
					challanPromise,
					...updatableChallanEntryPromises,
					// ...newChallanEntryPromises,
				])
					.then(() => reset(Object.assign({}, CHALLAN_NULL)))
					.then(() => {
						invalidateChallan();
						invalidateOtherChallan();
						navigate(`/delivery/challan/${updatedId}`);
					});
			} catch (err) {
				console.error(`Error with Promise.all: ${err}`);
			}

			return;
		}

		// Add new item
		var new_uuid = nanoid();
		const created_at = GetDateTime();

		const challanData = {
			...data,
			uuid: new_uuid,
			created_at,
			created_by: user.uuid,
			receive_status: data.receive_status === true ? 1 : 0,
			carton_quantity: data?.challan_entry?.length,
			gate_pass: data.gate_pass === true ? 1 : 0,
		};

		delete challanData['challan_entry'];

		const challanEntryData = [...data.challan_entry].map((item) => ({
			...item,
			uuid: nanoid(),
			challan_uuid: new_uuid,
			quantity: item?.quantity,
			created_at,
			remarks: item?.remarks,
		}));

		if (challanEntryData.length === 0) {
			alert('Select at least one item to proceed.');
		} else {
			// create new /packing/list
			await postData.mutateAsync({
				url: deliveryChallanUrl,
				newData: challanData,
				isOnCloseNeeded: false,
			});

			// create new /packing/list/entry
			// const challan_entry_promises = challanEntryData.map((item) =>
			// 	postData.mutateAsync({
			// 		url: deliveryChallanEntryUrl,
			// 		newData: item,
			// 		isOnCloseNeeded: false,
			// 	})
			// );
			const challanEntryPromises = data.challan_entry.map(
				async (item) => {
					const updatedData = {
						challan_uuid: challanData.uuid,
					};

					return await updateData.mutateAsync({
						url: `${deliveryChallanEntryUrl}/${
							item?.packing_list_uuid
						}`,
						updatedData: updatedData,
						uuid: item.uuid,
						isOnCloseNeeded: false,
					});
				}
			);

			try {
				await Promise.all([...challanEntryPromises])
					.then(() => reset(Object.assign({}, CHALLAN_NULL)))
					.then(() => {
						invalidateChallan();
						invalidateOtherChallan();
						navigate(`/delivery/challan/${new_uuid}`);
					});
			} catch (err) {
				console.error(`Error with Promise.all: ${err}`);
			}
		}
	};

	// Check if order_number is valid
	// if (getValues('quantity') === null) return <Navigate to='/not-found' />;
	const rowClass =
		'group px-3 py-2 whitespace-nowrap text-left text-sm font-normal tracking-wide';

	return (
		<div>
			<form
				className='flex flex-col gap-4'
				onSubmit={handleSubmit(onSubmit)}
				noValidate>
				<Header
					{...{
						register,
						errors,
						control,
						getValues,
						Controller,
						isUpdate,
						watch,
						setValue,
						setDeleteItem,
						deleteItem,
					}}
				/>
				<DynamicDeliveryField
					title={`Entry Details: `}
					tableHead={
						<>
							{watch('item_for') === 'zipper' ||
							watch('item_for') === 'sample_zipper'
								? [
										'PL No.',
										'Item Description',
										'Style',
										'Color',
										'Size',
										'Unit',
										'Delivered',
										'Quantity(pcs)',
										'Poly Qty',
										'Short QTY',
										'Reject QTY',
										'Remarks',
										,
									].map((item) => (
										<th
											key={item}
											scope='col'
											className='group cursor-pointer px-3 py-2 transition duration-300'>
											{item}
										</th>
									))
								: [
										'PL No.',
										'Count',
										'Style',
										'Color',
										'Length',
										'Unit',
										'Delivered',
										'Quantity(cones)',
										'Poly Qty',
										'Short QTY',
										'Reject QTY',
										'Remarks',
										,
									].map((item) => (
										<th
											key={item}
											scope='col'
											className='group cursor-pointer px-3 py-2 transition duration-300'>
											{item}
										</th>
									))}
						</>
					}>
					{challanEntryField.map((item, index) => {
						return (
							<tr
								key={item.id}
								className={cn(
									'relative cursor-pointer bg-base-100 text-primary transition-colors duration-200 ease-in',
									isUpdate &&
										watch(
											`challan_entry[${index}].isDeletable`
										) &&
										'bg-error/10 text-error hover:bg-error/20 hover:text-error'
								)}>
								<td className={`w-32 ${rowClass}`}>
									<LinkWithCopy
										title={getValues(
											`challan_entry[${index}].packing_number`
										)}
										id={getValues(
											`packing_list_uuids[${index}]`
										)}
										uri='/delivery/packing-list'
									/>
								</td>
								<td className={`w-32 ${rowClass}`}>
									{getValues(
										`challan_entry[${index}].item_description`
									)}
								</td>
								<td className={`w-32 ${rowClass}`}>
									{getValues(`challan_entry[${index}].style`)}
								</td>
								<td className={`w-32 ${rowClass}`}>
									{getValues(`challan_entry[${index}].color`)}
								</td>
								<td className={`w-32 ${rowClass}`}>
									{getValues(`challan_entry[${index}].size`)}
								</td>
								<td className={`w-32 ${rowClass}`}>
									{getValues(
										`challan_entry[${index}].is_inch`
									)
										? 'in'
										: 'cm'}
								</td>
								<td className={`${rowClass}`}>
									{getValues(
										`challan_entry[${index}].delivered`
									)}
								</td>
								<td className={`${rowClass}`}>
									{getValues(
										`challan_entry[${index}].quantity`
									)}
								</td>{' '}
								<td className={`${rowClass}`}>
									{getValues(
										`challan_entry[${index}].poli_quantity`
									)}
								</td>
								<td className={`${rowClass}`}>
									{getValues(
										`challan_entry[${index}].short_quantity`
									)}
								</td>
								<td className={`${rowClass}`}>
									{/* <Input
										label={`packing_list_entry[${index}].reject_quantity`}
										is_title_needed='false'
										height='h-8'
										dynamicerror={
											errors?.packing_list_entry?.[index]	
												?.reject_quantity
										}
										disabled={
											getValues(
												`packing_list_entry[${index}].reject_quantity`
											) === 0
										}
										{...{ register, errors }}
									/> */}
									{getValues(
										`challan_entry[${index}].reject_quantity`
									)}
								</td>
								<td className={`${rowClass}`}>
									{getValues(
										`challan_entry[${index}].remarks`
									)}
								</td>
							</tr>
						);
					})}
				</DynamicDeliveryField>

				{isUpdate && (
					<DynamicDeliveryField
						title={`New Entry Details: `}
						tableHead={
							<>
								{watch('item_for') === 'zipper'
									? [
											'PL No.',
											'Item Description',
											'Style',
											'Color',
											'Size',
											'Unit',
											'Delivered',
											'Quantity(pcs)',
											'Poly Qty',
											'Short QTY',
											'Reject QTY',
											'Remarks',
											,
										].map((item) => (
											<th
												key={item}
												scope='col'
												className='group cursor-pointer px-3 py-2 transition duration-300'>
												{item}
											</th>
										))
									: [
											'PL No.',
											'Count',
											'Style',
											'Color',
											'Length',
											'Unit',
											'Delivered',
											'Quantity(cones)',
											'Poly Qty',
											'Short QTY',
											'Reject QTY',
											'Remarks',
											,
										].map((item) => (
											<th
												key={item}
												scope='col'
												className='group cursor-pointer px-3 py-2 transition duration-300'>
												{item}
											</th>
										))}
							</>
						}>
						{newChallanEntryField.map((item, index) => {
							return (
								<tr
									key={item.id}
									className={cn(
										'relative cursor-pointer bg-base-100 text-primary transition-colors duration-200 ease-in',
										isUpdate &&
											watch(
												`new_challan_entry[${index}].isDeletable`
											) &&
											'bg-error/10 text-error hover:bg-error/20 hover:text-error'
									)}>
									<td className={`w-32 ${rowClass}`}>
										<LinkWithCopy
											title={getValues(
												`new_challan_entry[${index}].packing_number`
											)}
											id={getValues(
												`new_challan_entry[${index}].packing_list_uuid`
											)}
											uri='/delivery/packing-list'
										/>
									</td>
									<td className={`w-32 ${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].item_description`
										)}
									</td>
									<td className={`w-32 ${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].style`
										)}
									</td>
									<td className={`w-32 ${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].color`
										)}
									</td>
									<td className={`w-32 ${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].size`
										)}
									</td>

									<td className={`${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].delivered`
										)}
									</td>
									<td className={`${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].quantity`
										)}
									</td>
									<td className={`${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].short_quantity`
										)}
									</td>
									<td className={`${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].reject_quantity`
										)}
									</td>

									<td className={`${rowClass}`}>
										{getValues(
											`new_challan_entry[${index}].remarks`
										)}
									</td>
								</tr>
							);
						})}
					</DynamicDeliveryField>
				)}

				<div className='modal-action'>
					<SubmitButton />
				</div>
			</form>

			<Suspense>
				<UpdateModal
					modalId={'packing_list_delete'}
					title={`Delete Entry${deleteItem?.itemName}`}
					url={deliveryChallanEntryUrl}
					updateItem={deleteItem}
					setUpdateItem={setDeleteItem}
					updateData={updateData}
					// invalidateQuery={invalidatePackingList()}
				/>
			</Suspense>

			<DevTool control={control} placement='top-left' />
		</div>
	);
}
