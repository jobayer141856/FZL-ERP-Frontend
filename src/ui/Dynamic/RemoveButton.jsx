import { Trash2 } from 'lucide-react';

import cn from '@/lib/cn';

export default function RemoveButton({ showButton, onClick, className }) {
	if (!showButton) return null;
	return (
		<div className={cn('flex items-center justify-center', className)}>
			<Trash2
				className='btn btn-circle btn-ghost btn-error btn-xs text-error'
				onClick={onClick}
			/>
		</div>
	);
}
