import { useEffect, useState } from 'react';
import { cancelAllTransferData, getAllTransferData } from '../helpers/team';

/* This useTransferTracker hook allows other components to make use of continuously
 * team transfer node updates, both for initiated transfer and for the receiving end.
 */


//returns array of transfer objects (typically empty or one single transfer object)
function useTransferTracker(user, isInitiator=true) {
  
  const [transfers, setTransfers] = useState(null);
  
  useEffect( () => {
    //Subscribe to all transfer data changes for the specified user
    let dbDataRef = null;
    if (user !== null) {
      try {
        dbDataRef = getAllTransferData(user, isInitiator, (transfers) => {
          setTransfers(transfers);
        });
      } catch(e) {
        //TBD: something better than "fail silent"? (what error can actually propagate here?)
        console.log(e);
        setTransfers([]);
      }
    } else {
      setTransfers(null);
    }

    return () => {
      if (dbDataRef) {
        //Unsubscribe from prev user's transfer data
        try {
          cancelAllTransferData(user, isInitiator, dbDataRef);
        } catch(e) {
          console.log("Could not cancel subscription", e);
        }
      }
    };
  }, [user, isInitiator]);
  
  return transfers;
}

export default useTransferTracker;
