import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useDyeingThreadBatch } from '@/state/Dyeing';
import { useAuth } from '@context/auth';
import { DevTool } from '@hookform/devtools';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import {
	useFetch,
	useFetchForRhfReset,
	useFetchForRhfResetForPlanning,
	useRHF,
} from '@/hooks';

import { ProceedModal } from '@/components/Modal';
import ReactTable from '@/components/Table';
import { ShowLocalToast } from '@/components/Toast';
import { CheckBoxWithoutLabel, Input, Textarea } from '@/ui';

import nanoid from '@/lib/nanoid';
import {
	BOOLEAN,
	DYEING_THREAD_BATCH_NULL,
	DYEING_THREAD_BATCH_SCHEMA,
	NUMBER,
} from '@util/Schema';
import GetDateTime from '@/util/GetDateTime';

import Header from './Header';

// UPDATE IS WORKING
export default function Index() {
	const {
		data,
		url,
		updateData,
		postData,
		deleteData,
		isLoading,
		invalidateQuery: invalidateDyeingThreadBatch,
	} = useDyeingThreadBatch();
	const { batch_uuid } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const [isAllChecked, setIsAllChecked] = useState(false);
	const [isSomeChecked, setIsSomeChecked] = useState(false);
	const isUpdate = batch_uuid !== undefined;
	const [proceed, setProceed] = useState(false);
	const [batchData, setBatchData] = useState(null);
	const [batchEntry, setBatchEntry] = useState(null);

	// * if can_trx_quty exist koray taholay etar
	const SCHEMA = {
		...DYEING_THREAD_BATCH_SCHEMA,
		batch_entry: yup.array().of(
			yup.object().shape({
				is_checked: BOOLEAN,
				quantity: NUMBER.when('is_checked', {
					is: true,
					then: (schema) => schema.required('Required'),
					otherwise: (schema) => schema.nullable(),
				})
					.transform((value, originalValue) =>
						String(originalValue).trim() === '' ? null : value
					)
					.max(yup.ref('max_quantity'), 'Beyond Balance Quantity'),
				// batch_remarks: STRING.nullable(),
			})
		),
	};

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
	} = useRHF(SCHEMA, DYEING_THREAD_BATCH_NULL); // TODO: need to fix the form validation for quantity

	// batch_entry
	const { fields: BatchEntryField } = useFieldArray({
		control,
		name: 'batch_entry',
	});

	const [deleteItem, setDeleteItem] = useState({
		itemId: null,
		itemName: null,
	});

	const onClose = () => reset(DYEING_THREAD_BATCH_NULL);

	// * Fetch initial data
	isUpdate
		? useFetchForRhfReset(
				`/thread/batch-details/by/${batch_uuid}`,
				batch_uuid,
				reset
			)
		: useFetchForRhfResetForPlanning(`/thread/order-batch`, reset);
	const [minCapacity, setMinCapacity] = useState(0);
	const [maxCapacity, setMaxCapacity] = useState(0);
	const { value: machine } = useFetch('/other/machine/value/label');

	useEffect(() => {
		const machine_uuid = getValues('machine_uuid');

		if (machine_uuid !== undefined || machine_uuid !== null) {
			setMaxCapacity(
				machine?.find((item) => item.value === machine_uuid)
					?.max_capacity
			);
			setMinCapacity(
				machine?.find((item) => item.value === machine_uuid)
					?.min_capacity
			);
		}
	}, [watch()]);

	// const { value } = useFetch('/zipper/order-batch');

	// TODO: Not sure if this is needed. need further checking
	let order_info_ids;
	// useEffect(() => {
	// 	if (pi_uuid !== undefined) {
	// 		setOrderInfoIds((prev) => ({
	// 			...prev,
	// 			order_info_ids,
	// 		}));
	// 	}
	// }, [getValues('order_info_ids')]);
	const getTotalQty = useCallback(
		(batch_entry) =>
			batch_entry.reduce((acc, item) => {
				return item.is_checked ? acc + Number(item.quantity) : acc;
			}, 0),
		[watch()]
	);
	const getTotalCalTape = useCallback(
		(batch_entry) =>
			batch_entry.reduce((acc, item) => {
				if (!item.is_checked) return acc;
				const expected_weight =
					parseFloat(item.quantity || 0) *
					parseFloat(item.max_weight);

				return acc + expected_weight;
			}, 0),
		[watch()]
	);

	const onSubmit = async (data) => {
		// if (
		// 	getTotalCalTape(watch('batch_entry')) > maxCapacity ||
		// 	getTotalCalTape(watch('batch_entry')) < minCapacity
		// ) {
		// 	ShowLocalToast({
		// 		type: 'error',
		// 		message: `Machine Capacity  between ${minCapacity} and ${maxCapacity}`,
		// 	});
		// 	return;
		// }
		// * Update
		if (isUpdate) {
			const batch_data_updated = {
				...data,
				updated_at: GetDateTime(),
			};

			const batch_entry_updated = [...data?.batch_entry]
				.filter((item) => item.is_checked)
				.map((item) => ({
					...item,
					uuid: item.batch_entry_uuid,
					remarks: item.batch_remarks,
					updated_at: GetDateTime(),
				}));

			if (batch_entry_updated.length === 0) {
				ShowLocalToast({
					type: 'warning',
					message: 'Select at least one item to proceed.',
				});
			} else {
				await updateData.mutateAsync({
					url: `/thread/batch/${batch_data_updated?.uuid}`,
					updatedData: batch_data_updated,
					isOnCloseNeeded: false,
				});

				let batch_entry_updated_promises = [
					...batch_entry_updated.map(async (item) => {
						await updateData.mutateAsync({
							url: `/thread/batch-entry/${item.uuid}`,
							updatedData: item,
							isOnCloseNeeded: false,
						});
					}),
				];

				await Promise.all(batch_entry_updated_promises)
					.then(() =>
						reset(Object.assign({}, DYEING_THREAD_BATCH_NULL))
					)
					.then(() => {
						invalidateDyeingThreadBatch();
						navigate(`/dyeing-and-iron/thread-batch/${batch_uuid}`);
					})
					.catch((err) => console.log(err));
			}

			return;
		}

		// * ADD data
		const created_at = GetDateTime();
		const batch_data = {
			...data,
			uuid: nanoid(),
			created_at,
			created_by: user.uuid,
		};

		const batch_entry = [...data?.batch_entry]
			.filter((item) => item.is_checked)
			.map((item) => ({
				...item,
				uuid: nanoid(),
				batch_uuid: batch_data.uuid,
				transfer_quantity: 0,
				remarks: item.batch_remarks,
				created_at,
			}));
		setBatchData(batch_data); // * use for modal
		setBatchEntry(batch_entry); // * use for modal

		if (batch_entry.length === 0) {
			ShowLocalToast({
				type: 'warning',
				message: 'Select at least one item to proceed.',
			});
		} else {
			if (
				// * check if all colors are same
				!batch_entry.every(
					(item) => item.recipe_uuid === batch_entry[0].recipe_uuid
				) ||
				!batch_entry.every(
					// * check if all bleaching are same
					(item) => item.bleaching === batch_entry[0].bleaching
				)
			) {
				window['proceed_modal'].showModal(); // * if not then show modal
			} else {
				await postData.mutateAsync({
					url,
					newData: batch_data,
					isOnCloseNeeded: false,
				});

				let promises = [
					...batch_entry.map(
						async (item) =>
							await postData.mutateAsync({
								url: '/thread/batch-entry',
								newData: item,
								isOnCloseNeeded: false,
							})
					),
				];

				await Promise.all(promises)
					.then(() =>
						reset(Object.assign({}, DYEING_THREAD_BATCH_NULL))
					)
					.then(() => {
						invalidateDyeingThreadBatch();
						navigate(
							`/dyeing-and-iron/thread-batch/${batch_data.uuid}`
						);
					})
					.catch((err) => console.log(err));

				return;
			}
		}
		return;
	};

	// * useEffect for modal procees submit
	useEffect(() => {
		const proceedSubmit = async () => {
			await postData.mutateAsync({
				url,
				newData: batchData,
				isOnCloseNeeded: false,
			});

			let promises = [
				...batchEntry.map(
					async (item) =>
						await postData.mutateAsync({
							url: '/thread/batch-entry',
							newData: item,
							isOnCloseNeeded: false,
						})
				),
			];

			await Promise.all(promises)
				.then(() => reset(Object.assign({}, DYEING_THREAD_BATCH_NULL)))
				.then(() => {
					invalidateDyeingThreadBatch();
					navigate(`/dyeing-and-iron/thread-batch/${batchData.uuid}`);
				})
				.catch((err) => console.log(err));

			return;
		};

		if (proceed) proceedSubmit();
	}, [proceed]);

	// Check if order_number is valid
	if (getValues('quantity') === null) return <Navigate to='/not-found' />;
	const rowClass =
		'group px-3 py-2 whitespace-nowrap text-left text-sm font-normal tracking-wide';

	useEffect(() => {
		if (isAllChecked || isSomeChecked) {
			return BatchEntryField.forEach((item, index) => {
				if (isAllChecked) {
					setValue(`batch_entry[${index}].is_checked`, true);
				}
			});
		}
		if (!isAllChecked) {
			return BatchEntryField.forEach((item, index) => {
				setValue('is_all_checked', false);
				setValue(`batch_entry[${index}].is_checked`, false);
			});
		}
	}, [isAllChecked]);

	useEffect(() => {
		if (isUpdate) {
			setIsAllChecked(true);
			setValue('is_all_checked', true);
		}
	}, [isUpdate]);
	useEffect(() => {
		if (isAllChecked) {
			BatchEntryField.forEach((item, index) => {
				setValue(`batch_entry[${index}].is_checked`, true);
			});
		}
	}, [isAllChecked, BatchEntryField]);

	const handleRowChecked = (e, index) => {
		const isChecked = e.target.checked;
		setValue(`batch_entry[${index}].is_checked`, isChecked);

		let isEveryChecked = true,
			isSomeChecked = false;

		for (let item of watch('batch_entry')) {
			if (item.is_checked) {
				isSomeChecked = true;
			} else {
				isEveryChecked = false;
				setValue('is_all_checked', false);
			}

			if (isSomeChecked && !isEveryChecked) {
				break;
			}
		}

		setIsAllChecked(isEveryChecked);
		setIsSomeChecked(isSomeChecked);
	};

	const setAllQty = () => {
		BatchEntryField.map((item, idx) => {
			setValue(`batch_entry[${idx}].quantity`, item.balance_quantity);
		});
	};

	const columns = useMemo(
		() => [
			{
				accessorKey: 'checkbox',
				header: () => (
					<CheckBoxWithoutLabel
						className='bg-white'
						label='is_all_checked'
						checked={isAllChecked}
						onChange={(e) => {
							setIsAllChecked(e.target.checked);
							setIsSomeChecked(e.target.checked);
						}}
						{...{ register, errors }}
					/>
				),
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => (
					<CheckBoxWithoutLabel
						label={`batch_entry[${info.row.index}].is_checked`}
						checked={watch(
							`batch_entry[${info.row.index}].is_checked`
						)}
						onChange={(e) => handleRowChecked(e, info.row.index)}
						disabled={
							getValues(
								`batch_entry[${info.row.index}].pi_quantity`
							) == 0
						}
						{...{ register, errors }}
					/>
				),
			},
			{
				accessorKey: 'order_number',
				header: 'O/N',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'recipe_name',
				header: 'Shade Recipe',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'style',
				header: 'Style',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'color',
				header: 'Color',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'count_length',
				header: 'Count Length',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'bleaching',
				header: 'Bleaching',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'po',
				header: 'PO',
				enableColumnFilter: true,
				enableSorting: true,
			},
			{
				accessorKey: 'order_quantity',
				header: 'Order QTY',
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'balance_quantity',
				header: (
					<div className='flex flex-col'>
						Balance
						<label
							className='btn btn-primary btn-xs'
							onClick={() => setAllQty()}>
							Copy All
						</label>
					</div>
				),
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => {
					const idx = info.row.index;
					return (
						<div className='flex gap-4'>
							<label
								className='btn btn-primary btn-xs'
								onClick={() =>
									setValue(
										`batch_entry[${idx}].quantity`,
										info.getValue()
									)
								}>
								Copy
							</label>
							{info.getValue()}
						</div>
					);
				},
			},
			{
				accessorKey: 'quantity',
				header: 'Quantity',
				enableColumnFilter: false,
				enableSorting: false,

				cell: (info) => {
					const idx = info.row.index;
					const dynamicerror = errors?.batch_entry?.[idx]?.quantity;
					return (
						<Input
							label={`batch_entry[${info.row.index}].quantity`}
							is_title_needed='false'
							height='h-8'
							dynamicerror={dynamicerror}
							{...{ register, errors }}
						/>
					);
				},
			},
			{
				accessorKey: 'expected_weight',
				header: (
					<div>
						Expected <br /> Weight
					</div>
				),
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => {
					const { max_weight } = info.row.original;
					const expected_weight =
						parseFloat(
							watch(`batch_entry[${info.row.index}].quantity`) ||
								0
						) * parseFloat(max_weight);

					return Number(expected_weight).toFixed(3);
				},
			},
			{
				accessorKey: 'batch_remarks',
				header: 'Remarks',
				enableColumnFilter: false,
				enableSorting: false,
				width: 'w-44',
				cell: (info) => (
					<Textarea
						label={`batch_entry[${info.row.index}].batch_remarks`}
						is_title_needed='false'
						height='h-8'
						{...{ register, errors }}
					/>
				),
			},
		],
		[isAllChecked, isSomeChecked, BatchEntryField, register, errors]
	);

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
						minCapacity,
						maxCapacity,
						totalQuantity: getTotalQty(watch('batch_entry')),
						totalWeight: getTotalCalTape(watch('batch_entry')),
					}}
				/>

				{/* todo: react-table  */}

				<ReactTable data={BatchEntryField} columns={columns} />

				<div className='modal-action'>
					<button className='text-md btn btn-primary btn-block'>
						Save
					</button>
				</div>
			</form>

			<Suspense>
				<ProceedModal
					text='Shade or Bleach'
					modalId={'proceed_modal'}
					setProceed={setProceed}
				/>
			</Suspense>

			<DevTool control={control} placement='top-left' />
		</div>
	);
}
