// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { niceConfig } from "@/utils/niceConfig";
import type { NextApiRequest, NextApiResponse } from "next";
const exec = require("child_process").exec;

export type NiceData = {
  sEncData: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<NiceData>
) {
  const sAuthType = "M"; //없으면 기본 선택화면, M(휴대폰), X(인증서공통), U(공동인증서), F(금융인증서), S(PASS인증서), C(신용카드)
  const sCustomize = "Mobile"; //없으면 기본 웹페이지 / Mobile : 모바일페이지

  const { sitecode, sitepw, modulePath } = niceConfig;

  // 본인인증 처리 후, 결과 데이타를 리턴 받기위해 다음예제와 같이 http부터 입력합니다.
  const sReturnUrl = "http://localhost:3000/nice/success"; // 성공시 이동될 URL (방식 : 프로토콜을 포함한 절대 주소)
  const sErrorUrl = "http://localhost:3000/check_fail"; // 실패시 이동될 URL (방식 : 프로토콜을 포함한 절대 주소)

  const d = new Date();
  const sCPRequest = sitecode + "_" + d.getTime();

  //전달 원문 데이터 초기화
  let sPlaincData = "";
  //전달 암호화 데이터 초기화
  let sEncData = "";

  sPlaincData =
    "7:REQ_SEQ" +
    sCPRequest.length +
    ":" +
    sCPRequest +
    "8:SITECODE" +
    sitecode.length +
    ":" +
    sitecode +
    "9:AUTH_TYPE" +
    sAuthType.length +
    ":" +
    sAuthType +
    "7:RTN_URL" +
    sReturnUrl.length +
    ":" +
    sReturnUrl +
    "7:ERR_URL" +
    sErrorUrl.length +
    ":" +
    sErrorUrl +
    "9:CUSTOMIZE" +
    sCustomize.length +
    ":" +
    sCustomize;

  const cmd =
    modulePath +
    " " +
    "ENC" +
    " " +
    sitecode +
    " " +
    sitepw +
    " " +
    sPlaincData;

  const child = exec(cmd, { encoding: "euc-kr" });
  child.stdout.on("data", (data: string) => {
    sEncData += data;
  });

  //exec 실행이 종료 했을때 대한 이벤트 헨들러
  child.on("close", () => {
    //이곳에서 result처리
    //처리 결과 메시지
    let sRtnMSG = "";
    //처리 결과 확인
    if (sEncData == "-1") {
      sRtnMSG = "암/복호화 시스템 오류입니다.";
    } else if (sEncData == "-2") {
      sRtnMSG = "암호화 처리 오류입니다.";
    } else if (sEncData == "-3") {
      sRtnMSG = "암호화 데이터 오류 입니다.";
    } else if (sEncData == "-9") {
      sRtnMSG =
        "입력값 오류 : 암호화 처리시, 필요한 파라미터 값을 확인해 주시기 바랍니다.";
    } else {
      sRtnMSG = "";
    }

    res.send({ sEncData });
  });
}
