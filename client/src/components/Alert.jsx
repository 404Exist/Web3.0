import { useContext } from 'react';
import { MdError } from 'react-icons/md';
import { useDebouncedCallback } from 'use-debounce';
import { TransactionContext } from '../context/TransactionContext';

const Alert = ({ message, icon, color, time }) => {
  const { alertMsg, setAlertMsg } = useContext(TransactionContext);
  const debounced = useDebouncedCallback( () => setAlertMsg(''),  time || 2000);
  debounced();
  return (
    <div className={`p-1 fixed z-50 top-0 right-0 transition-opacity duration-500 ${alertMsg ? 'opacity-100' : 'opacity-0'}`}>
      {alertMsg && (
        <div className={`p-3 ${color ?? 'bg-red-700'} rounded-md w-full`}>
          <p className="text-white flex items-center justify-between w-full">{icon || <MdError fontSize={22}/>} <span className='ml-1'>{message || alertMsg}</span></p>
        </div>
      )}
    </div>
  )
}

export default Alert
