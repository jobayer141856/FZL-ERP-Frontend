import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import {
	useDyeingFinishingBatch,
	useDyeingFinishingBatchByUUID,
	useDyeingFinishingBatchOrders,
} from '@/state/Dyeing';
import { DevTool } from '@hookform/devtools';
import { useNavigate, useParams } from 'react-router-dom';
import { useRHF } from '@/hooks';

import { DeleteModal } from '@/components/Modal';
import ReactTable from '@/components/Table';
import SubmitButton from '@/ui/Others/Button/SubmitButton';

import nanoid from '@/lib/nanoid';
import GetDateTime from '@/util/GetDateTime';
import {
	FINISHING_BATCH_ENTRY_NULL,
	FINISHING_BATCH_ENTRY_SCHEMA,
} from '@/util/Schema';

import { Columns } from './Columns';
import Header from './Header';

export default function index() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { batch_uuid } = useParams();
	const isUpdate = batch_uuid !== undefined;

	const {
		data,
		postData,
		updateData,
		deleteData,
		invalidateQuery: invalidateNewFinishingBatch,
	} = useDyeingFinishingBatchByUUID(batch_uuid, 'is_update=true');
	const { invalidateQuery: invalidateDetails } = useDyeingFinishingBatchByUUID(batch_uuid);
	const { invalidateQuery } = useDyeingFinishingBatch();

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
	} = useRHF(FINISHING_BATCH_ENTRY_SCHEMA, FINISHING_BATCH_ENTRY_NULL);

	useEffect(() => {
		if (data && isUpdate) {
			reset(data); // Reset the form with updated data
		}
	}, [data, reset]);

	const { data: batchOrders } = useDyeingFinishingBatchOrders(
		watch('order_description_uuid')
	);

	const { fields: BatchOrdersField, remove: BatchOrdersFieldRemove } =
		useFieldArray({
			control,
			name: 'finishing_batch_entry',
		});

	const { fields: NewBatchOrdersField } = useFieldArray({
		control,
		name: 'new_finishing_batch_entry',
	});

	// * setting finishing_batch_entry after fetching it
	useEffect(() => {
		if (!isUpdate) {
			setValue(
				'finishing_batch_entry',
				batchOrders?.length > 0 ? batchOrders : []
			);
		}

		// * on update sometimes the useFieldArray does not update so we need to set it manually
		// * this condition is need to trigger the useFieldArray to update to show the data
		if (isUpdate) {
			setValue('finishing_batch_entry', data?.finishing_batch_entry);
			setValue(
				'new_finishing_batch_entry',
				data?.new_finishing_batch_entry
			);
		}
	}, [batchOrders, watch('order_description_uuid'), data]);

	const onSubmit = async (data) => {
		if (isUpdate) {
			await updateData.mutateAsync({
				url: `/zipper/finishing-batch/${data.uuid}`,
				updatedData: { ...data, updated_at: GetDateTime() },
				isOnCloseNeeded: false,
			});

			// * update existing finishing batch entry
			const finishingEntryUpdatedPromises = [
				...data?.finishing_batch_entry,
			]
				.filter((item) => item.quantity > 0)
				.map(
					async (item) =>
						await updateData.mutateAsync({
							url: `/zipper/finishing-batch-entry/${item.uuid}`,
							updatedData: { ...item, updated_at: GetDateTime() },
							isOnCloseNeeded: false,
						})
				);

			// * create new finishing batch entry
			const newFinishingEntryData = [...data?.new_finishing_batch_entry]
				.filter((item) => item.quantity > 0)
				.map(
					async (item) =>
						await postData.mutateAsync({
							url: '/zipper/finishing-batch-entry',
							newData: {
								...item,
								uuid: nanoid(),
								finishing_batch_uuid: data.uuid,
								created_at: GetDateTime(),
							},
							isOnCloseNeeded: false,
						})
				);

			await Promise.all([
				...finishingEntryUpdatedPromises,
				...newFinishingEntryData,
			])
				.then(() => reset(FINISHING_BATCH_ENTRY_NULL))
				.then(() => {
					invalidateQuery();
					invalidateDetails();
					navigate(`/dyeing-and-iron/finishing-batch/${data.uuid}`);
				})
				.catch((err) => console.log(err));

			return;
		}

		const finishingData = {
			...data,
			uuid: nanoid(),
			created_at: GetDateTime(),
			created_by: user.uuid,
		};

		await postData.mutateAsync({
			url: '/zipper/finishing-batch',
			newData: finishingData,
			isOnCloseNeeded: false,
		});

		const finishingEntryData = [...data?.finishing_batch_entry]
			.filter((item) => item.quantity > 0)
			.map((item) => ({
				...item,
				uuid: nanoid(),
				finishing_batch_uuid: finishingData.uuid,
				created_at: GetDateTime(),
			}));

		let promises = [
			...finishingEntryData.map(
				async (item) =>
					await postData.mutateAsync({
						url: '/zipper/finishing-batch-entry',
						newData: item,
						isOnCloseNeeded: false,
					})
			),
		];

		await Promise.all(promises)
			.then(() => reset(FINISHING_BATCH_ENTRY_NULL))
			.then(() => {
				invalidateQuery();
				navigate(
					`/dyeing-and-iron/finishing-batch/${finishingData.uuid}`
				);
			})
			.catch((err) => console.log(err));
		return;
	};

	// const columns = useMemo(
	// 	() => [
	// 		{
	// 			accessorKey: 'recipe_id',
	// 			header: 'Recipe',
	// 			enableColumnFilter: true,
	// 			width: 'w-36',
	// 			cell: (info) => info.getValue(),
	// 		},
	// 		{
	// 			accessorKey: 'style',
	// 			header: 'Style',
	// 			enableColumnFilter: true,
	// 			width: 'w-36',
	// 			cell: (info) => info.getValue(),
	// 		},
	// 		{
	// 			accessorKey: 'color',
	// 			header: 'Color',
	// 			enableColumnFilter: true,
	// 			width: 'w-36',
	// 			cell: (info) => info.getValue(),
	// 		},
	// 		{
	// 			accessorKey: 'size',
	// 			header: 'Size',
	// 			enableColumnFilter: true,
	// 			width: 'w-36',
	// 			cell: (info) => info.getValue(),
	// 		},
	// 		{
	// 			accessorKey: 'order_quantity',
	// 			header: 'Order QTY',
	// 			enableColumnFilter: true,
	// 			width: 'w-36',
	// 			cell: (info) => info.getValue(),
	// 		},
	// 		{
	// 			accessorKey: 'balance_quantity',
	// 			width: 'w-36',
	// 			header: (
	// 				<div className='flex flex-col'>
	// 					Balance QTY
	// 					<label
	// 						className='btn btn-primary btn-xs'
	// 						onClick={() => setAllQty()}>
	// 						Copy All
	// 					</label>
	// 				</div>
	// 			),
	// 			enableColumnFilter: false,
	// 			enableSorting: false,
	// 			cell: (info) => {
	// 				const idx = info.row.index;
	// 				return (
	// 					<div className='flex gap-4'>
	// 						<label
	// 							className='btn btn-primary btn-xs'
	// 							onClick={() =>
	// 								setValue(
	// 									`finishing_batch_entry[${idx}].quantity`,
	// 									info.getValue()
	// 								)
	// 							}>
	// 							Copy
	// 						</label>
	// 						{info.getValue()}
	// 					</div>
	// 				);
	// 			},
	// 		},
	// 		{
	// 			accessorKey: 'quantity',
	// 			header: 'Quantity',
	// 			enableColumnFilter: false,
	// 			enableSorting: false,
	// 			width: 'w-36',
	// 			cell: (info) => {
	// 				const idx = info.row.index;
	// 				const dynamicError =
	// 					errors?.finishing_batch_entry?.[idx]?.quantity;

	// 				return (
	// 					<Input
	// 						label={`finishing_batch_entry[${info.row.index}].quantity`}
	// 						is_title_needed='false'
	// 						height='h-8'
	// 						dynamicerror={dynamicError}
	// 						{...{ register, errors }}
	// 					/>
	// 				);
	// 			},
	// 		},
	// 		{
	// 			accessorKey: 'remarks',
	// 			header: 'Remarks',
	// 			enableColumnFilter: false,
	// 			enableSorting: false,
	// 			width: 'w-36',
	// 			cell: (info) => {
	// 				const idx = info.row.index;
	// 				const dynamicError =
	// 					errors?.finishing_batch_entry?.[idx]?.remarks;

	// 				return (
	// 					<Textarea
	// 						label={`finishing_batch_entry[${info.row.index}].remarks`}
	// 						is_title_needed='false'
	// 						height='h-8'
	// 						dynamicerror={dynamicError}
	// 						{...{ register, errors }}
	// 					/>
	// 				);
	// 			},
	// 		},
	// 		{
	// 			accessorKey: 'actions',
	// 			header: 'Actions',
	// 			enableColumnFilter: false,
	// 			enableSorting: false,
	// 			hidden: !haveAccess.includes('delete'),
	// 			width: 'w-24',
	// 			cell: (info) => (
	// 				<EditDelete
	// 					idx={info.row.index}
	// 					handelDelete={handelDelete}
	// 					showDelete={haveAccess.includes('delete')}
	// 					showUpdate={false}
	// 				/>
	// 			),
	// 		},
	// 	],
	// 	[BatchOrdersField, watch('order_description_uuid'), errors]
	// );

	// * for deleting the finishing field entry

	const [deleteEntry, setDeleteEntry] = useState({
		itemId: null,
		itemName: null,
	});

	const handelDelete = (index) => {
		const UUID = getValues(`finishing_batch_entry[${index}].uuid`);
		if (UUID !== undefined) {
			setDeleteEntry({
				itemId: UUID,
				itemName: UUID,
			});
			window['finishing_batch_entry_delete'].showModal();
		}
		BatchOrdersFieldRemove(index);
	};

	// * table columns for new finishing field on new entry or updating/deleting existing finishing field
	const currentColumns = Columns({
		setValue,
		BatchOrdersField,
		handelDelete,
		register,
		errors,
		watch,
	});

	// * table columns for adding new finishing field on update
	const NewColumns = Columns({
		setValue,
		NewBatchOrdersField,
		register,
		errors,
		watch,
		is_new: true,
	});

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)} noValidate>
				<div className='flex flex-col gap-8'>
					<Header
						{...{
							register,
							errors,
							control,
							getValues,
							Controller,
							watch,
						}}
					/>

					<ReactTable
						title={'Batch Orders'}
						data={BatchOrdersField}
						columns={currentColumns}
					/>

					{isUpdate && (
						<ReactTable
							title={'Add New Batch Orders'}
							data={NewBatchOrdersField}
							columns={NewColumns}
						/>
					)}
				</div>
				<div className='modal-action'>
					<SubmitButton />
				</div>
			</form>
			<DevTool control={control} placement='top-left' />
			<Suspense>
				<DeleteModal
					modalId={'finishing_batch_entry_delete'}
					title={'Batch Entry Delete'}
					deleteItem={deleteEntry}
					setDeleteItem={setDeleteEntry}
					setItems={BatchOrdersField}
					deleteData={deleteData}
					url={`/zipper/finishing-batch-entry`}
					invalidateQuery={invalidateNewFinishingBatch}
				/>
			</Suspense>
		</div>
	);
}
