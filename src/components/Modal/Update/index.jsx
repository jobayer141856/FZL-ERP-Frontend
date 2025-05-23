import { DeleteFooter, Header } from '../ui';

const Body = ({ item }) => (
	<p className='text-center text-2xl font-light text-black'>
		Do you want to update <span className='font-semibold'>{item}</span>?
	</p>
);

export default function Index({
	modalId = '',
	title = '',
	url = '',
	updateItem,
	setUpdateItem,
	updateData,
	invalidateQuery = () => {},
	invalidateQueryArray = [],
}) {
	const handelClose = () => {
		setUpdateItem((prev) => ({
			...prev,
			itemId: null,
			itemName: null,
		}));
		window[modalId].close();
	};

	const handelCancelClick = () => {
		handelClose();
	};

	const onSubmit = async () => {
		await updateData.mutateAsync({
			url: `${url}/${updateItem?.itemId}`,
			updatedData: updateItem,
			onClose: handelClose,
		});

		invalidateQuery();

		// Invalidate an array of queries
		if (invalidateQueryArray.length > 0) {
			invalidateQueryArray.forEach((query) => {
				query();
			});
		}
	};

	return (
		<dialog id={modalId} className='modal modal-bottom sm:modal-middle'>
			<form
				onSubmit={onSubmit}
				noValidate
				method='dialog'
				className='modal-box bg-white text-secondary-content'
			>
				<Header title={`Update ${title}`} onClose={handelCancelClick} />
				<Body item={updateItem?.itemName} />
				<DeleteFooter {...{ handelCancelClick }} />
			</form>
		</dialog>
	);
}
