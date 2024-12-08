"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import qs from "qs";

import PropertyListItem from "./PropertyListItem";

import { usePropertyStore } from "@/store/usePropertyStore";
import { PropertyItem } from "@/types/property";

interface IPropertyListProps {
  address: string | null;
}

export default function PropertyList({ address }: IPropertyListProps) {
  const params = usePropertyStore(state => state.params);
  const router = useRouter();
  const [items, setItems] = useState<PropertyItem[]>([]);

  const mapHouseType = (type: string): string => {
    const mapping: Record<string, string> = {
      VILLA: "빌라",
      OFFICETEL: "오피스텔",
      APARTMENT: "아파트",
    };
    return mapping[type] || type;
  };

  const mapTradeType = (type: string): string => {
    const mapping: Record<string, string> = {
      SALE: "매매",
      MONTHLY_RENT: "월세",
      LONG_TERM_RENT: "전세",
    };
    return mapping[type] || type;
  };

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

        console.log(response.data);

        setItems(response.data);
      } catch (error) {
        console.log("property/list API 요청 중 오류 발생", error);
      }
    };

    fetchData();
  }, [address, params]);

  const handleClick = () => {
    router.push("/detail");
  };

  return (
    <>
      {items.length > 0 ? (
        // items 데이터 렌더링
        items.map((item, index) => (
          <PropertyListItem
            key={index}
            tradeType={mapTradeType(item.tradeType)}
            price={item.price}
            rentPrice={item.rentPrice}
            travelTime={item.travelTime}
            address={item.addressNumber}
            houseType={mapHouseType(item.houseType)}
            floor={item.floor}
            onClick={handleClick}
          />
        ))
      ) : (
        // 데이터가 없을 경우 메시지 표시
        <div className="text-center mt-4">매물을 찾을 수 없습니다.</div>
      )}
    </>
  );
}
