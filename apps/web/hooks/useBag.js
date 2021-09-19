import { useState, useEffect } from "react";
import { useManualQuery } from "graphql-hooks";
import bags from "../data/loot.json";
import eth from "../ethers";
import { shortenAddress } from "@utils";
import useCurrentUser from "@hooks/useCurrentUser";

const BAG_QUERY = `query BagQuery($id: ID!) {
  bag(id: $id) {
    id
    currentOwner {
      address
      bagsHeld
    }
  }

  transfers(where: { bag: $id }) {
    from{
   address
  }
  to {
    address
 }
  timestamp
  txHash

  }
}`;

const useBag = id => {
  const [bag, setBag] = useState(null);
  const [fetchedEns, setFetchedEns] = useState(false);
  const currentUser = useCurrentUser();

  const [fetchBag] = useManualQuery(BAG_QUERY);

  useEffect(() => {
    const getBag = async () => {
      let bagData = bags.find(b => b.id == id);

      const { data } = await fetchBag({
        variables: { id }
      });

      let ownerAddress = data.bag.currentOwner.address;

      let response = await fetch("/api/prices");
      let prices = await response.json();

      setBag({
        ...data.bag,
        ...bagData,
        shortName: shortenAddress(ownerAddress),
        isForSale: !!prices[id],
        price: prices[id],
        transfers: data.transfers
      });
    };

    if (id) {
      getBag();
    }
  }, [id]);

  useEffect(() => {
    const getEnsName = async () => {
      let ownerAddress = bag.currentOwner.address;
      let ens = await eth.getEnsName(ownerAddress);
      let avatar = await eth.getAvatar(ens);

      setFetchedEns(true);
      setBag({
        ...bag,
        ownerAvatar: avatar,
        shortName: ens || shortenAddress(ownerAddress)
      });
    };

    if (currentUser && bag && !fetchedEns) {
      getEnsName();
    }
  }, [currentUser, bag]);

  return bag;
};

export default useBag;
