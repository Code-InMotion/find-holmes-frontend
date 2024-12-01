import { useEffect, useState } from "react";

import TextInput from "./TextInput";
import Label from "./Label";
import TimeRangeSlider from "./TimeRangeSlider";
import TagList from "./TagList";
import CostRangeSlider from "./CostRangeSlider";
import Button from "./LinkButton";

import { HouseType, TradeType } from "@/types/property";

interface RequestData {
  address: string;
  travelTime: number;
  houseType: HouseType[];
  tradeType: TradeType[];
  deposit?: [number, number]; // 선택적 필드
  monthly?: [number, number]; // 선택적 필드
  priority: string;
}

export default function Filter() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [formValues, setFormValues] = useState<RequestData>({
    address: "",
    travelTime: 0,
    houseType: [], // 매물 유형
    tradeType: [], // 거래 유형
    deposit: [0, 300000000],
    monthly: [0, 3500000],
    priority: "",
  });

  const mapHouseType = (type: string): HouseType => {
    const mapping: Record<string, HouseType> = {
      아파트: "APARTMENT",
      오피스텔: "OFFICETEL",
      빌라: "VILLA",
    };
    return mapping[type];
  };

  const mapTradeType = (type: string): TradeType => {
    const mapping: Record<string, TradeType> = {
      매매: "SALE",
      전세: "LONG_TERM_RENT",
      월세: "MONTHLY_RENT",
    };
    return mapping[type];
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 요청 데이터 생성
    const requestData: RequestData = {
      address: formValues.address,
      travelTime: formValues.travelTime,
      houseType: formValues.houseType,
      tradeType: formValues.tradeType,
      priority: formValues.priority,
    };

    // 조건부로 비용 데이터를 추가
    if (
      formValues.tradeType.includes("SALE") ||
      formValues.tradeType.includes("LONG_TERM_RENT")
    ) {
      requestData.deposit = formValues.deposit;
    }

    if (formValues.tradeType.includes("MONTHLY_RENT")) {
      requestData.monthly = formValues.monthly;
    }

    console.log("API 요청 데이터:", requestData);
  };

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement> | string): void => {
      if (typeof e === "string") {
        setFormValues(prev => ({ ...prev, [field]: e }));
      } else {
        setFormValues(prev => ({ ...prev, [field]: e.target.value }));
      }
    };

  const handleTravelTimeChange = (value: number) => {
    setFormValues(prev => ({ ...prev, travelTime: value })); // 단일 값으로 업데이트
  };

  const handleHouseTypeChange = (selectedTags: string[]) => {
    setFormValues(prev => ({
      ...prev,
      houseType: selectedTags.map(mapHouseType),
    }));
  };

  const handleTradeTypeChange = (selectedTags: string[]) => {
    setFormValues(prev => ({
      ...prev,
      tradeType: selectedTags.map(mapTradeType),
    }));
  };

  const handlePriorityChange = (selectedTag: string) => {
    setFormValues(prev => ({ ...prev, priority: selectedTag }));
  };

  const handleCostChange =
    (type: "deposit" | "monthly") => (values: [number, number]) => {
      setFormValues(prev => ({
        ...prev,
        [type]: values,
      }));
    };

  const houseTypeTags = ["아파트", "오피스텔", "빌라"];
  const tradeTypeTags = ["매매", "전세", "월세"];
  const priorityTags = ["시간", "예산"];

  useEffect(() => {
    const requiredFieldsSelected =
      formValues.address.trim() !== "" &&
      formValues.houseType.length > 0 &&
      formValues.tradeType.length > 0 &&
      formValues.priority.trim() !== "";

    setIsButtonDisabled(!requiredFieldsSelected);
  }, [formValues]);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-[38px] py-[40px]"
    >
      <TextInput
        label="1. 회사 또는 학교를 입력해주세요."
        placeholder="서울시 서대문구 현저동 941"
        value={formValues.address}
        onChange={handleInputChange("address")}
      />

      <div>
        <Label>2. 희망 소요 시간을 입력해주세요.</Label>
        <TimeRangeSlider
          min={0}
          max={80}
          value={formValues.travelTime}
          onChange={handleTravelTimeChange}
        />
      </div>

      <div>
        <Label>3. 원하는 매물 유형을 선택해주세요.</Label>
        <TagList
          tagList={houseTypeTags}
          onChange={tags => handleHouseTypeChange(tags as string[])}
        />
      </div>

      <div>
        <Label>4. 원하는 거래 유형을 선택해주세요.</Label>
        <TagList
          tagList={tradeTypeTags}
          onChange={tags => handleTradeTypeChange(tags as string[])}
        />
      </div>

      <div className="mb-[38px]">
        <Label>5. 예상하시는 가격을 입력해주세요.</Label>
        <div className="flex flex-col gap-[60px]">
          {/* 초기 상태나 매매/전세가 선택된 경우 보증금 슬라이더 표시 */}
          {(formValues.tradeType.length === 0 ||
            formValues.tradeType.includes("SALE") ||
            formValues.tradeType.includes("LONG_TERM_RENT")) && (
            <CostRangeSlider
              min={0}
              max={300000000}
              type="전세/매매/보증금"
              value={formValues.deposit ?? [0, 0]}
              onChange={handleCostChange("deposit")}
            />
          )}

          {/* 초기 상태나 월세가 선택된 경우 월세 슬라이더 표시 */}
          {(formValues.tradeType.length === 0 ||
            formValues.tradeType.includes("MONTHLY_RENT")) && (
            <CostRangeSlider
              min={0}
              max={3500000}
              type="월세"
              value={formValues.monthly ?? [0, 0]}
              onChange={handleCostChange("monthly")}
            />
          )}
        </div>
      </div>

      <div>
        <Label>6. 무엇이 더 중요한가요?</Label>
        <TagList
          tagList={priorityTags}
          onChange={tag => handlePriorityChange(tag as string)}
          isSingleSelect={true}
        />
      </div>

      <Button
        theme={isButtonDisabled ? "disabled" : "primary"}
        isDisabled={isButtonDisabled}
        onClick={() => {}}
        navigateTo="/top-5"
      >
        지역 추천
      </Button>
    </form>
  );
}
