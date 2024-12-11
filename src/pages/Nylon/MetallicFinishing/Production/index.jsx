import { lazy, useMemo, useState } from 'react';
import { useNylonMFProduction } from '@/state/Nylon';
import { useAccess } from '@/hooks';

import { Suspense } from '@/components/Feedback';
import ReactTable from '@/components/Table';
import { LinkWithCopy, StatusButton, Transfer } from '@/ui';

import PageInfo from '@/util/PageInfo';

const Production = lazy(() => import('./Production'));
const Transaction = lazy(() => import('./Transaction'));

export default function Index() {
	const { data, url, isLoading } = useNylonMFProduction();
	const info = new PageInfo(
		'Metallic Finishing Production',
		url,
		'nylon__metallic_finishing_production'
	);
	const haveAccess = useAccess('nylon__metallic_finishing_production');

	const columns = useMemo(
		() => [
			{
				accessorKey: 'batch_number',
				header: 'Batch No.',
				enableColumnFilter: true,
				width: 'w-36',
				cell: (info) => {
					const { finishing_batch_uuid } = info.row.original;

					return (
						<LinkWithCopy
							title={info.getValue()}
							id={finishing_batch_uuid}
							uri={`/dyeing-and-iron/finishing-batch`}
						/>
					);
				},
			},
			{
				accessorKey: 'order_number',
				header: 'O/N',
				enableColumnFilter: true,
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
				cell: (info) => {
					const { order_description_uuid, order_number } =
						info.row.original;
					return (
						<LinkWithCopy
							title={info.getValue()}
							id={order_description_uuid}
							uri={`/order/details/${order_number}`}
						/>
					);
				},
			},
			{
				accessorKey: 'order_type',
				header: 'Type',
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'is_waterproof',
				header: 'Waterproof',
				enableColumnFilter: false,
				width: 'w-24',
				cell: (info) => (
					<StatusButton size='btn-sm' value={info.getValue()} />
				),
			},
			{
				accessorKey: 'style',
				header: 'Style',
				width: 'w-32',
				enableColumnFilter: false,
				cell: (info) => (
					<span className='capitalize'>{info.getValue()}</span>
				),
			},
			{
				accessorKey: 'color',
				header: 'Color',
				enableColumnFilter: false,
				cell: (info) => (
					<span className='capitalize'>{info.getValue()}</span>
				),
			},
			{
				accessorKey: 'size',
				header: 'size',
				enableColumnFilter: false,
				cell: (info) => (
					<span className='capitalize'>{info.getValue()}</span>
				),
			},
			{
				accessorKey: 'batch_quantity',
				header: (
					<span>
						Batch QTY
						<br />
						(PCS)
					</span>
				),
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'tape_transferred',
				header: 'Tape Stock (KG)',
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},

			{
				accessorKey: 'slider_finishing_stock',
				header: 'Slider Stock (PCS)',
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'balance_quantity',
				header: (
					<span>
						Balance
						<br />
						(PCS)
					</span>
				),
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'actions_add_production',
				header: 'Add Production',
				enableColumnFilter: false,
				enableSorting: false,
				hidden: !haveAccess.includes('click_production'),
				cell: (info) => {
					const { balance_quantity, slider_finishing_stock } =
						info.row.original;

					return (
						<Transfer
							onClick={() => handelProduction(info.row.index)}
							disabled={
								Math.min(
									Number(balance_quantity),
									Number(slider_finishing_stock)
								) <= 0
									? true
									: false
							}
						/>
					);
				},
			},
			{
				accessorKey: 'finishing_prod',
				header: 'Production',
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: 'warehouse',
				header: 'Warehouse',
				enableColumnFilter: false,
				cell: (info) => info.getValue(),
			},
		],
		[data]
	);

	const [updateMFProd, setUpdateMFProd] = useState({
		sfg_uuid: null,
		section: null,
		coloring_prod: null,
		balance_quantity: null,
		nylon_metallic_finishing: null,
		production_quantity_in_kg: null,
		production_quantity: null,
		wastage: null,
		remarks: null,
	});
	const handelProduction = (idx) => {
		const val = data[idx];
		setUpdateMFProd((prev) => ({
			...prev,
			...val,
		}));

		window['MFProdModal'].showModal();
	};

	const [updateMFTRX, setUpdateMFTRX] = useState({
		uuid: null,
		sfg_uuid: null,
		trx_quantity_in_kg: null,
		trx_quantity_in: null,
		trx_from: null,
		trx_to: null,
		remarks: '',
		finishing_prod: null,
	});
	const handelTransaction = (idx) => {
		const val = data[idx];
		setUpdateMFTRX((prev) => ({
			...prev,
			...val,
		}));

		window['MFTrxModal'].showModal();
	};

	if (isLoading)
		return <span className='loading loading-dots loading-lg z-50' />;
	// if (error) return <h1>Error:{error}</h1>;

	return (
		<div>
			<ReactTable title={info.getTitle()} data={data} columns={columns} />
			<Suspense>
				<Production
					modalId='MFProdModal'
					{...{
						updateMFProd,
						setUpdateMFProd,
					}}
				/>
			</Suspense>
			<Suspense>
				<Transaction
					modalId='MFTrxModal'
					{...{
						updateMFTRX,
						setUpdateMFTRX,
					}}
				/>
			</Suspense>
		</div>
	);
}
