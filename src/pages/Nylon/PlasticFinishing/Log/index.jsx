import { useEffect } from 'react';
import RMOrderAgainstLog from './RMOrderAgainstLog';
import RMTransferLog from './RMTransferLog';
import SFGTransferLog from './SFGTransferLog';
import TapeLog from './Transfer';
import Transfer from './TransferLog';
import TransferProduction from './TransferProduction';
export default function Index() {
	useEffect(() => {
		document.title = 'Finishing Log';
	}, []);
	return (
		<div>
			<SFGTransferLog />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<RMTransferLog />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<RMOrderAgainstLog />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TransferProduction />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<Transfer />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TapeLog />
		</div>
	);
}
