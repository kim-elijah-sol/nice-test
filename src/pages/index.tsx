import { NiceData } from "./api/nice";

declare global {
  interface Document {
    passForm: HTMLFormElement;
  }
}

export default function Home() {
  function handleSubmut(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    fetch("/api/nice")
      .then((res) => res.json())
      .then((res: NiceData) => {
        const passForm = document.passForm;

        passForm.action =
          "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb";
        passForm.EncodeData.value = res.sEncData;
        passForm.submit();
      });
  }

  return (
    <form name="passForm" method="post" onSubmit={handleSubmut}>
      <input type="hidden" name="m" value="checkplusService" />
      <input type="hidden" name="EncodeData" />

      <button type="submit"> nice 표준인증창 호출 버튼 </button>
    </form>
  );
}
