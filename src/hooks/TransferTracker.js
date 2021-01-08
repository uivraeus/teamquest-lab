import { useEffect, useState } from 'react';
import { cancelAllTransferData, getAllTransferData } from '../helpers/team';

/* This useTransferTracker hook allows other components to make use of continuously
 * team transfer node updates, both for initiated transfer and for the receiving end.
 */

//used to avoid propagating updates between different empty list instances
const emptyList = []; 

//returns array of transfer objects (typically empty or one single transfer object)
function useTransferTracker(user, isInitiator=true) {
  //transfers is null by default to indicate "unknown" (then it's usually [])
  const [transfers, setTransfers] = useState(null);
  
  useEffect( () => {
    //Subscribe to all transfer data changes for the specified user
    let dbDataRef = null;
    if (user !== null) {
      try {
        dbDataRef = getAllTransferData(user, isInitiator, (transfers) => {
          if (transfers && transfers.length)
            setTransfers(transfers);
          else
            setTransfers(emptyList);
        });
      } catch(e) {
        //TBD: something better than "fail silent"? (what error can actually propagate here?)
        console.log(e);
        setTransfers(null);
      }
    } else {
      setTransfers(null); //default/unknown
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
