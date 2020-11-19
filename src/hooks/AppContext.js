import { useContext } from 'react';
import { AppContext } from '../components/AppContext'

/* Minimal (unnecessary?) wrapper for accessing the AppContext
 */

function useAppContext() {
  return useContext(AppContext); 
}

export default useAppContext;
