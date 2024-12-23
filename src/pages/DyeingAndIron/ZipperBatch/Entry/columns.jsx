import { useMemo } from 'react';
import { useAccess } from '@/hooks';

import { EditDelete, Input, LinkWithCopy, Textarea } from '@/ui';

export const Columns = ({
	isUpdate,
	setValue,
	BatchOrdersField = [],
	NewBatchOrdersField = [],
	handelDelete = () => {},
	register,
	errors,
	watch = () => {},
	is_new = false,
}) => {
	const haveAccess = useAccess('dyeing__zipper_batch_entry_update');

	// * setting all quantity in finishing_batch_entry to the balance quantity
	const setAllQty = () => {
		if (is_new) {
			NewBatchOrdersField.map((item, idx) => {
				setValue(
					`new_dyeing_batch_entry[${idx}].quantity`,
					item.balance_quantity
				);
			});
		} else {
			BatchOrdersField.map((item, idx) => {
				setValue(
					`dyeing_batch_entry[${idx}].quantity`,
					item.balance_quantity
				);
			});
		}
	};
	const commonColumns = [
		{
			accessorKey: 'order_number',
			header: 'Order ID',
			width: 'w-32',
			enableSorting: true,
			cell: (info) => {
				const { order_number } = info.row.original;
				return (
					<LinkWithCopy
						title={info.getValue()}
						id={order_number}
						uri='/order/details'
					/>
				);
			},
		},
		{
			accessorKey: 'item_description',
			header: 'Item Description',
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			accessorKey: 'order_type',
			header: 'Type',
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			accessorKey: 'style',
			header: 'Style',
			width: 'w-36',
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			accessorKey: 'bleaching',
			header: 'Bleach',
			width: 'w-36',
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
			accessorKey: 'size',
			header: 'Size (CM)',
			enableColumnFilter: true,
			enableSorting: true,
		},
		{
			accessorKey: 'order_quantity',
			header: 'Order QTY',
			enableColumnFilter: true,
			enableSorting: true,
			width: 'w-20',
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: 'top',
			header: 'Tape QTY (Kg)',
			enableColumnFilter: true,
			enableSorting: true,
			cell: ({ row }) => {
				const { top, bottom, raw_mtr_per_kg, size, order_quantity } =
					row.original;

				const total_size_in_mtr =
					((parseFloat(top) + parseFloat(bottom) + parseFloat(size)) *
						parseFloat(order_quantity)) /
					100;

				return Number(
					total_size_in_mtr / parseFloat(raw_mtr_per_kg)
				).toFixed(3);
			},
		},
	];
	const defaultColumns = useMemo(
		() => [
			...commonColumns,
			{
				accessorKey: 'balance_quantity',
				header: (
					<div className='flex flex-col'>
						Balanced Batch
						{/* <label
							className='btn btn-primary btn-xs'
							onClick={() => setAllQty()}>
							Copy All
						</label> */}
					</div>
				),
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => {
					const idx = info.row.index;
					return (
						<div className='flex gap-4'>
							<input
								type='button'
								className='btn btn-primary btn-xs'
								disabled={isUpdate}
								value={'Copy'}
								onClick={() =>
									setValue(
										`dyeing_batch_entry[${idx}].quantity`,
										info.getValue(),
										{
											shouldDirty: true,
										}
									)
								}
							/>

							{info.getValue()}
						</div>
					);
				},
			},

			{
				accessorKey: 'batch_qty',
				header: 'Batch QTY',
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => {
					const idx = info.row.index;
					const dynamicerror =
						errors?.dyeing_batch_entry?.[idx]?.quantity;
					return (
						<Input
							label={`dyeing_batch_entry[${idx}].quantity`}
							is_title_needed='false'
							height='h-8'
							dynamicerror={dynamicerror}
							{...{ register, errors }}
						/>
					);
				},
			},
			{
				accessorKey: 'top',
				header: 'Cal Tape (Kg)',
				enableColumnFilter: false,
				enableSorting: true,
				cell: ({ row }) => {
					const { top, bottom, raw_mtr_per_kg, size, order_type } =
						row.original;
					const idx = row.index;

					// * for tape order we calculate with size as quantity 
					const total_size_in_mtr =
						order_type === 'tape'
							? ((parseFloat(top) +
									parseFloat(bottom) +
									parseFloat(
										watch(
											`dyeing_batch_entry[${idx}].quantity`
										) || 0
									)) *
									1) /
								100
							: ((parseFloat(top) +
									parseFloat(bottom) +
									parseFloat(size)) *
									parseFloat(
										watch(
											`dyeing_batch_entry[${idx}].quantity`
										) || 0
									)) /
								100;

					return Number(
						total_size_in_mtr / parseFloat(raw_mtr_per_kg)
					).toFixed(3);
				},
			},
			{
				accessorKey: 'remarks',
				header: 'Remarks',
				enableColumnFilter: false,
				enableSorting: false,
				width: 'w-44',
				cell: (info) => (
					<Textarea
						label={`dyeing_batch_entry[${info.row.index}].remarks`}
						is_title_needed='false'
						height='h-8'
						{...{ register, errors }}
					/>
				),
			},
			{
				accessorKey: 'actions',
				header: 'Actions',
				enableColumnFilter: false,
				enableSorting: false,
				hidden: !haveAccess.includes('delete') || !isUpdate,
				width: 'w-24',
				cell: (info) => (
					<EditDelete
						idx={info.row.index}
						handelDelete={handelDelete}
						showDelete={haveAccess.includes('delete') && isUpdate}
						showUpdate={false}
					/>
				),
			},
		],
		[BatchOrdersField, register, errors]
	);
	const newColumns = useMemo(
		() => [
			...commonColumns,
			{
				accessorKey: 'balance_quantity',
				header: (
					<div className='flex flex-col'>
						Balanced Batch
						{/* <label
							className='btn btn-primary btn-xs'
							onClick={() => setAllQty()}>
							Copy All
						</label> */}
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
										`new_dyeing_batch_entry[${idx}].quantity`,
										info.getValue(),
										{
											shouldDirty: true,
										}
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
				accessorKey: 'batch_qty',
				header: 'Batch QTY',
				enableColumnFilter: false,
				enableSorting: false,
				cell: (info) => {
					const idx = info.row.index;
					const dynamicerror =
						errors?.new_dyeing_batch_entry?.[idx]?.quantity;
					return (
						<Input
							label={`new_dyeing_batch_entry[${idx}].quantity`}
							is_title_needed='false'
							height='h-8'
							dynamicerror={dynamicerror}
							{...{ register, errors }}
						/>
					);
				},
			},
			{
				accessorKey: 'top',
				header: 'Cal Tape (Kg)',
				enableColumnFilter: false,
				enableSorting: true,
				cell: ({ row }) => {
					const { top, bottom, raw_mtr_per_kg, size } = row.original;
					const idx = row.index;

					const total_size_in_mtr =
						((parseFloat(top) +
							parseFloat(bottom) +
							parseFloat(size)) *
							parseFloat(
								watch(
									`new_dyeing_batch_entry[${idx}].quantity`
								) || 0
							)) /
						100;

					return Number(
						total_size_in_mtr / parseFloat(raw_mtr_per_kg)
					).toFixed(3);
				},
			},
			{
				accessorKey: 'remarks',
				header: 'Remarks',
				enableColumnFilter: false,
				enableSorting: false,
				width: 'w-44',
				cell: (info) => (
					<Textarea
						label={`new_dyeing_batch_entry[${info.row.index}].remarks`}
						is_title_needed='false'
						height='h-8'
						{...{ register, errors }}
					/>
				),
			},
		],
		[NewBatchOrdersField, register, errors]
	);

	const columns = useMemo(
		() => [...(is_new ? newColumns : defaultColumns)],
		[...(is_new ? [NewBatchOrdersField] : [BatchOrdersField]), errors]
	);

	return columns;
};
