import bodyParser from "body-parser";
import util from "util";
import { GetServerSideProps } from "next";
import { syncExec } from "@/utils/syncExec";
import { niceConfig } from "@/utils/niceConfig";

const getBody = util.promisify(bodyParser.urlencoded());

function GetValue(plaindata: string, key: string) {
  const arrData = plaindata.split(":");
  let value = "";
  for (let i = 0; i < arrData.length; i++) {
    const item = arrData[i];
    if (item.indexOf(key) == 0) {
      const valLen = parseInt(item.replace(key, ""));
      arrData[i++];
      value = arrData[i].substr(0, valLen);
      break;
    }
  }
  return value;
}

type NiceBody = {
  EncodeData: string;
};

function SuccessPage() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res: { [key in string]: string } = {};

  let sEncData = "";

  if (ctx.req.method === "POST") {
    await getBody(ctx.req, ctx.res);

    sEncData = ((ctx.req as any).body as NiceBody).EncodeData;
  } else {
    sEncData = ctx.query.EncodeData as string;
  }

  let cmd = "";
  let sRtnMSG = "";

  const { sitecode, sitepw, modulePath } = niceConfig;

  if (/^0-9a-zA-Z+\/=/.test(sEncData) == true) {
    sRtnMSG = "입력값 오류";
    return {
      notFound: true,
    };
  }

  if (sEncData != "") {
    cmd =
      modulePath + " " + "DEC" + " " + sitecode + " " + sitepw + " " + sEncData;
  }

  await syncExec(cmd).then((sDecData) => {
    //처리 결과 확인
    if (sDecData == "-1") {
      sRtnMSG = "암/복호화 시스템 오류";
    } else if (sDecData == "-4") {
      sRtnMSG = "복호화 처리 오류";
    } else if (sDecData == "-5") {
      sRtnMSG = "HASH값 불일치 - 복호화 데이터는 리턴됨";
    } else if (sDecData == "-6") {
      sRtnMSG = "복호화 데이터 오류";
    } else if (sDecData == "-9") {
      sRtnMSG = "입력값 오류";
    } else if (sDecData == "-12") {
      sRtnMSG = "사이트 비밀번호 오류";
    } else {
      //항목의 설명은 개발 가이드를 참조
      res.requestnumber = decodeURIComponent(GetValue(sDecData, "REQ_SEQ")); //CP요청 번호 , main에서 생성한 값을 되돌려준다. 세션등에서 비교 가능
      res.responsenumber = decodeURIComponent(GetValue(sDecData, "RES_SEQ")); //고유 번호 , 나이스에서 생성한 값을 되돌려준다.
      res.authtype = decodeURIComponent(GetValue(sDecData, "AUTH_TYPE")); //인증수단
      res.name = decodeURIComponent(GetValue(sDecData, "UTF8_NAME")); //이름
      res.birthdate = decodeURIComponent(GetValue(sDecData, "BIRTHDATE")); //생년월일(YYYYMMDD)
      res.gender = decodeURIComponent(GetValue(sDecData, "GENDER")); //성별
      res.nationalinfo = decodeURIComponent(GetValue(sDecData, "NATIONALINFO")); //내.외국인정보
      res.dupinfo = decodeURIComponent(GetValue(sDecData, "DI")); //중복가입값(64byte)
      res.conninfo = decodeURIComponent(GetValue(sDecData, "CI")); //연계정보 확인값(88byte)
      res.mobileno = decodeURIComponent(GetValue(sDecData, "MOBILE_NO")); //휴대폰번호(계약된 경우)
      res.mobileco = decodeURIComponent(GetValue(sDecData, "MOBILE_CO")); //통신사(계약된 경우)
    }
  });

  return {
    props: {},
  };
};

export default SuccessPage;
