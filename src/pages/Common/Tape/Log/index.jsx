import { useEffect } from 'react';

import ProductionLog from './Production';
import RMOrderAgainstLog from './RMOrderAgainstLog';
import RMTransferLog from './RMTransferLog';
import TapeDyeingStore from './Tape-Dyeing-store';
import TapeToCoil from './TapeToCoilLog';
import TapeToDying from './TapeToDyeing';
import TransferLog from './TransferLog';

export default function Index() {
	useEffect(() => {
		document.title = 'Tape Log';
	}, []);
	return (
		<div>
			<RMTransferLog />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			{/* <RMOrderAgainstLog />
			<hr className='my-6 border-2 border-dashed border-secondary-content' /> */}
			<ProductionLog />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TapeToCoil />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TapeDyeingStore type='tape_to_dyeing' />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TapeDyeingStore type='tape_to_store' />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TapeToDying />
			<hr className='my-6 border-2 border-dashed border-secondary-content' />
			<TransferLog />
		</div>
	);
}
