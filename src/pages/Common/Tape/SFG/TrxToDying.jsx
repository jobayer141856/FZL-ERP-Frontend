import { useAuth } from '@/context/auth';
import { useCommonTapeSFG } from '@/state/Common';
import { useRHF } from '@/hooks';

import { AddModal } from '@/components/Modal';
import { FormField, Input, JoinInput, ReactSelect } from '@/ui';

import nanoid from '@/lib/nanoid';
import {
	TAPE_STOCK_TRX_TO_DYING_NULL,
	TAPE_STOCK_TRX_TO_DYING_SCHEMA,
} from '@util/Schema';
import GetDateTime from '@/util/GetDateTime';

export default function Index({
	modalId = '',
	updateTapeProd = {
		uuid: null,
		name: null,
		quantity: null,
		item_name: null,
		zipper_number: null,
		type: null,
	},
	setUpdateTapeProd,
}) {
	const { postData } = useCommonTapeSFG();

	const { user } = useAuth();
	const schema = {
		trx_quantity: TAPE_STOCK_TRX_TO_DYING_SCHEMA.trx_quantity,
		remarks: TAPE_STOCK_TRX_TO_DYING_SCHEMA.remarks,
	};

	const {
		register,
		handleSubmit,
		control,
		Controller,
		errors,
		reset,
		context,
	} = useRHF(schema, TAPE_STOCK_TRX_TO_DYING_NULL);

	const onClose = () => {
		setUpdateTapeProd((prev) => ({
			...prev,
			uuid: null,
			type: null,
			quantity: null,
			zipper_number: null,
			type_of_zipper: null,
			order_entry_id: null,
		}));
		reset(TAPE_STOCK_TRX_TO_DYING_NULL);
		window[modalId].close();
	};

	const onSubmit = async (data) => {
		const updatedData = {
			uuid: nanoid(),
			tape_coil_uuid: updateTapeProd.uuid,
			trx_quantity: data.trx_quantity,
			tape_transfer_type: updateTapeProd.tape_transfer_type,
			created_by: user?.uuid,
			created_at: GetDateTime(),
			remarks: data.remarks,
		};

		await postData.mutateAsync({
			url: `/zipper/tape-transfer-to-dyeing`,
			newData: updatedData,
			onClose,
		});
	};

	return (
		<AddModal
			id={modalId}
			title={updateTapeProd?.id !== null && 'Tape to Dying'}
			formContext={context}
			onSubmit={handleSubmit(onSubmit)}
			onClose={onClose}
			isSmall={true}
		>
			<JoinInput
				label='trx_quantity'
				unit='KG'
				{...{ register, errors }}
			/>
			<Input label='remarks' {...{ register, errors }} />
		</AddModal>
	);
}
