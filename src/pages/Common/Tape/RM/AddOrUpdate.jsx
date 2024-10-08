import { useAuth } from '@/context/auth';
import { useCommonTapeRM, useCommonTapeRMLog } from '@/state/Common';
import { useRHF } from '@/hooks';

import { AddModal } from '@/components/Modal';
import { ShowLocalToast } from '@/components/Toast';
import { Input, JoinInput } from '@/ui';

import nanoid from '@/lib/nanoid';
import { RM_MATERIAL_USED_NULL, RM_MATERIAL_USED_SCHEMA } from '@util/Schema';
import GetDateTime from '@/util/GetDateTime';

export default function Index({
	modalId = '',
	updateTapeStock = {
		uuid: null,
		unit: null,
		tape_making: null,
	},
	setUpdateTapeStock,
}) {
	const { user } = useAuth();
	const { url, postData } = useCommonTapeRM();
	const { invalidateQuery: invalidateCommonTapeRMLog } = useCommonTapeRMLog();
	const MAX_QUANTITY = updateTapeStock?.tape_making;

	const schema = {
		used_quantity: RM_MATERIAL_USED_SCHEMA.remaining.max(
			updateTapeStock?.tape_making
		),
		wastage: RM_MATERIAL_USED_SCHEMA.remaining,
	};

	const { register, handleSubmit, errors, reset, watch, context } = useRHF(
		schema,
		RM_MATERIAL_USED_NULL
	);

	const MAX_WASTAGE = MAX_QUANTITY - watch('used_quantity');
	// 	MAX_QUANTITY - getTotalQty(watch('coil_to_dyeing_entry'));
	const onClose = () => {
		setUpdateTapeStock((prev) => ({
			...prev,
			uuid: null,
			unit: null,
			tape_making: null,
		}));
		reset(RM_MATERIAL_USED_NULL);
		window[modalId].close();
	};

	const onSubmit = async (data) => {
		if (MAX_WASTAGE <= watch('wastage')) {
			ShowLocalToast({
				type: 'error',
				message: 'Beyond Stock',
			});
			return;
		}
		const updatedData = {
			...data,

			material_uuid: updateTapeStock?.uuid,
			section: 'tape_making',
			created_by: user?.uuid,
			created_by_name: user?.name,
			uuid: nanoid(),
			created_at: GetDateTime(),
		};
		await postData.mutateAsync({
			url: '/material/used',
			newData: updatedData,
			onClose,
		});
		invalidateCommonTapeRMLog();
	};

	return (
		<AddModal
			id={modalId}
			title={updateTapeStock?.uuid !== null && 'Material Usage Entry'}
			formContext={context}
			onSubmit={handleSubmit(onSubmit)}
			onClose={onClose}
			isSmall={true}>
			<JoinInput
				label='used_quantity'
				sub_label={`Max: ${Number(updateTapeStock?.tape_making)}`}
				unit={updateTapeStock?.unit}
				max={updateTapeStock?.tape_making}
				placeholder={`Max: ${Number(updateTapeStock?.tape_making)}`}
				{...{ register, errors }}
			/>
			<JoinInput
				label='wastage'
				unit={updateTapeStock?.unit}
				sub_label={`Max: ${(updateTapeStock?.tape_making -
					watch('used_quantity') <
				0
					? 0
					: updateTapeStock?.tape_making - watch('used_quantity')
				).toFixed(2)}`}
				placeholder={`Max: ${(updateTapeStock?.tape_making -
					watch('used_quantity') <
				0
					? 0
					: updateTapeStock?.tape_making - watch('used_quantity')
				).toFixed(2)}`}
				{...{ register, errors }}
			/>
			<Input label='remarks' {...{ register, errors }} />
		</AddModal>
	);
}
