"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import qs from "qs";

import PropertyListItem from "./PropertyListItem";
import NoItem from "./NoItem";

import { usePropertyStore } from "@/store/usePropertyStore";
import { PropertyItem } from "@/types/property";
import { mapHouseType, mapTradeType } from "@/utils/mappingType";
import { formatToWonUnit } from "@/utils/formatNumber";

interface IPropertyListProps {
  address: string | null;
}

export default function PropertyList({ address }: IPropertyListProps) {
  const params = usePropertyStore(state => state.params);
  const router = useRouter();
  const [items, setItems] = useState<PropertyItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        console.error("Address 값이 유효하지 않습니다.");
        return;
      }

      try {
        const updatedParams = {
          ...params,
          address,
        };

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_KEY}/property/list`,
          {
            params: updatedParams,
            paramsSerializer: params => {
              return qs.stringify(params, { arrayFormat: "repeat" });
            },
          }
        );

        setItems(response.data);
      } catch (error) {
        console.log("property/list API 요청 중 오류 발생", error);
      }
    };

    fetchData();
  }, [address, params]);

  const handleClick = (id: string) => {
    router.push(`/detail?id=${encodeURIComponent(id)}`);
  };

  return (
    <>
      {items.length > 0 ? (
        // items 데이터 렌더링
        items.map((item, index) => (
          <PropertyListItem
            key={index}
            tradeType={mapTradeType(item.tradeType)}
            price={formatToWonUnit(item.price)}
            rentPrice={item.rentPrice}
            travelTime={item.travelTime}
            address={item.addressNumber}
            houseType={mapHouseType(item.houseType)}
            floor={item.floor}
            onClick={() => handleClick(item.id)}
          />
        ))
      ) : (
        <NoItem />
      )}
    </>
  );
}
