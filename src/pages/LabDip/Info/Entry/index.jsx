import { UpdateModal } from '@/components/Modal';
import { useFetch, useFetchForRhfResetForOrder, useRHF } from '@/hooks';
import nanoid from '@/lib/nanoid';
import { useLabDipInfo } from '@/state/LabDip';
import {
	ActionButtons,
	DynamicField,
	FormField,
	Input,
	JoinInput,
	ReactSelect,
	Textarea,
} from '@/ui';
import GetDateTime from '@/util/GetDateTime';
import { useAuth } from '@context/auth';
import { DevTool } from '@hookform/devtools';
import { LAB_INFO_NULL, LAB_INFO_SCHEMA } from '@util/Schema';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { HotKeys, configure } from 'react-hotkeys';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';

export default function Index() {
	const { url, updateData, postData, deleteData } = useLabDipInfo();
	const { info_number, info_uuid } = useParams();

	const { user } = useAuth();
	const navigate = useNavigate();

	// * used for checking if it is for update*//
	const isUpdate = info_uuid !== undefined && info_number !== undefined;

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
	} = useRHF(LAB_INFO_SCHEMA, LAB_INFO_NULL);

	useEffect(() => {
		info_number !== undefined
			? (document.title = `Order: Update ${info_number}`)
			: (document.title = 'Order: Entry');
	}, []);

	if (isUpdate)
		useFetchForRhfResetForOrder(
			`/lab-dip/info/details/${info_uuid}`,
			info_uuid,
			reset
		);

	// recipe
	const {
		fields: recipeField,
		append: recipeAppend,
		remove: recipeRemove,
	} = useFieldArray({
		control,
		name: 'recipe',
	});

	const [updateItem, setUpdateItem] = useState({
		itemId: null,
		itemName: null,
	});

	const handleRecipeRemove = (index) => {
		if (getValues(`recipe[${index}].recipe_uuid`) !== undefined) {
			setUpdateItem((prev) => ({
				...prev,
				itemId: getValues(`recipe[${index}].recipe_uuid`),
				itemName: getValues(`recipe[${index}].recipe_uuid`),
			}));
			console.log('into close modal');

			window['recipe_update'].showModal();
		}
		recipeRemove(index);
	};

	const handelRecipeAppend = () => {
		recipeAppend({
			recipe_uuid: '',
		});
	};

	const onClose = () => reset(LAB_INFO_NULL);

	// Submit
	const onSubmit = async (data) => {
		// * Update data * //
		if (isUpdate) {
			// * updated order description * //
			const lab_info_updated = {
				...data,
				lab_status: data.lab_status ? 1 : 0,
				updated_at: GetDateTime(),
			};

			await updateData.mutateAsync({
				url: `/lab-dip/info/${data?.uuid}`,
				updatedData: lab_info_updated,
				isOnCloseNeeded: false,
			});

			// * updated recipe * //
			const recipe_updated = [...data.recipe].map((item) => ({
				...item,
				lab_dip_info_uuid: data.uuid,
				updated_at: GetDateTime(),
			}));

			// * insert the recipe data using update function * //
			let recipe_updated_promises = [
				...lab_info_updated.recipe.map(
					async (item) =>
						await updateData.mutateAsync({
							url: `/lab-dip/update-recipe/by/${item.recipe_uuid}`,
							updatedData: recipe_updated,
							isOnCloseNeeded: false,
						})
				),
			];

			// * old code* //
			// let order_entry_updated_promises = [
			// 	...recipe_updated.map(async (item) => {
			// 		if (item.uuid) {
			// 			await updateData.mutateAsync({
			// 				url: `/lab-dip/recipe-entry/${item.uuid}`,
			// 				updatedData: item,
			// 				isOnCloseNeeded: false,
			// 			});
			// 		} else {
			// 			await postData.mutateAsync({
			// 				url: '/lab-dip/recipe-entry',
			// 				newData: {
			// 					...item,
			// 					uuid: nanoid(),
			// 					recipe_uuid:
			// 						data?.uuid,
			// 					created_at: GetDateTime(),
			// 				},
			// 				isOnCloseNeeded: false,
			// 			});
			// 		}
			// 	}),
			// ];

			// navigate(
			// 	`/order/details/${recipe_id}/${recipe_uuid}`
			// );

			return;
		}

		// * Add new data*//
		const lab_dip_info_uuid = nanoid();
		const created_at = GetDateTime();

		const lab_info = {
			...data,
			uuid: lab_dip_info_uuid,
			lab_status: data.lab_status ? 1 : 0,
			created_at,
			created_by: user?.uuid,
		};

		console.log('lab_info:', lab_info);
		//* Post new order description */ //
		await postData.mutateAsync({
			url,
			newData: lab_info,
			isOnCloseNeeded: false,
		});

		const recipe = [...data.recipe].map((item) => ({
			lab_dip_info_uuid,
		}));

		// * insert the recipe data using update function
		let recipe_promises = [
			...lab_info.recipe.map(
				async (item) =>
					await updateData.mutateAsync({
						url: `/lab-dip/update-recipe/by/${item.recipe_uuid}`,
						updatedData: recipe,
						isOnCloseNeeded: false,
					})
			),
		];

		//* Post new entry *//
		// let recipe_entry_promises = [
		// 	...recipe_entry.map(
		// 		async (item) =>
		// 			await postData.mutateAsync({
		// 				url: '/lab-dip/recipe-entry',
		// 				newData: item,
		// 				isOnCloseNeeded: false,
		// 			})
		// 	),
		// ];

		await Promise.all(recipe_promises)
			.then(() => reset(Object.assign({}, ORDER_NULL)))
			.then(navigate(`/lab-dip/info`))
			.catch((err) => console.log(err));
	};

	// Check if recipe_id is valid
	if (getValues('quantity') === null) return <Navigate to='/not-found' />;

	const handelDuplicateDynamicField = useCallback(
		(index) => {
			const item = getValues(`recipe[${index}]`);
			recipeAppend({ ...item, uuid: undefined });
		},
		[getValues, recipeAppend]
	);

	const handleEnter = (event) => {
		event.preventDefault();
		if (Object.keys(errors).length > 0) return;
	};

	const keyMap = {
		NEW_ROW: 'alt+n',
		COPY_LAST_ROW: 'alt+c',
		ENTER: 'enter',
	};

	const handlers = {
		NEW_ROW: handelRecipeAppend,
		COPY_LAST_ROW: () =>
			handelDuplicateDynamicField(recipeField.length - 1),
		ENTER: (event) => handleEnter(event),
	};

	configure({
		ignoreTags: ['input', 'select', 'textarea'],
		ignoreEventsCondition: function () {},
	});

	const { value: rec_uuid } = useFetch(`/other/lab-dip/recipe/value/label`);

	const rowClass =
		'group whitespace-nowrap text-left text-sm font-normal tracking-wide';

	return (
		<div>
			<HotKeys {...{ keyMap, handlers }}>
				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className='flex flex-col gap-4'>
					<Header
						{...{
							register,
							errors,
							control,
							getValues,
							Controller,
							watch,
							lab_status: getValues('lab_status'),
						}}
					/>
					<DynamicField
						title='Recipe'
						handelAppend={handelRecipeAppend}
						tableHead={['Recipe', 'Action'].map((item) => (
							<th
								key={item}
								scope='col'
								className='group cursor-pointer select-none whitespace-nowrap bg-secondary py-2 text-left font-semibold tracking-wide text-secondary-content transition duration-300 first:pl-2'>
								{item}
							</th>
						))}>
						{recipeField.map((item, index) => (
							<tr key={item.id}>
								{/* Recipe */}
								<td className={rowClass}>
									<FormField
										label={`recipe[${index}].recipe_uuid`}
										title='Recipe uuid'
										dynamicerror={
											errors?.recipe?.[index]?.recipe_uuid
										}
										is_title_needed='false'>
										<Controller
											name={`recipe[${index}].recipe_uuid`}
											control={control}
											render={({
												field: { onChange },
											}) => {
												return (
													<ReactSelect
														placeholder='Select recipe uuid'
														options={rec_uuid}
														value={rec_uuid?.find(
															(item) =>
																item.value ==
																getValues(
																	`recipe[${index}].recipe_uuid`
																)
														)}
														onChange={(e) =>
															onChange(e.value)
														}
														isDisabled={
															rec_uuid ==
															undefined
														}
														menuPortalTarget={
															document.body
														}
													/>
												);
											}}
										/>
									</FormField>
								</td>

								<td
									className={`w-16 ${rowClass} border-l-4 border-l-primary`}>
									<ActionButtons
										duplicateClick={() =>
											handelDuplicateDynamicField(index)
										}
										removeClick={() =>
											handleRecipeRemove(index)
										}
										showRemoveButton={true}
									/>
								</td>
							</tr>
						))}
					</DynamicField>
					<div className='modal-action'>
						<button
							type='submit'
							className='text-md btn btn-primary btn-block'>
							Save
						</button>
					</div>
				</form>
			</HotKeys>
			<Suspense>
				<UpdateModal
					modalId={'recipe_update'}
					title={'Recipe Entry'}
					updateItem={updateItem}
					setUpdateItem={setUpdateItem}
					url={`/lab-dip/update-recipe/remove-lab-dip-info-uuid/by`}
					updateData={updateData}
				/>
			</Suspense>

			<DevTool control={control} placement='top-left' />
		</div>
	);
}
