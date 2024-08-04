import { GetInfo } from "/function-domeggook.js";
import { useDownload } from "/zipImages.js";

const svgPathData = "M7.5 15C8.52451 15 9.48775 14.8039 10.3897 14.4118C11.2966 14.0196 12.0956 13.4779 12.7868 12.7868C13.4779 12.0956 14.0196 11.299 14.4118 10.3971C14.8039 9.4902 15 8.52451 15 7.5C15 6.47549 14.8039 5.51226 14.4118 4.61029C14.0196 3.70343 13.4779 2.90441 12.7868 2.21324C12.0956 1.52206 11.2966 0.980392 10.3897 0.588235C9.48284 0.196078 8.51716 0 7.49265 0C6.46814 0 5.50245 0.196078 4.59559 0.588235C3.69363 0.980392 2.89706 1.52206 2.20588 2.21324C1.51961 2.90441 0.980392 3.70343 0.588235 4.61029C0.196078 5.51226 0 6.47549 0 7.5C0 8.52451 0.196078 9.4902 0.588235 10.3971C0.980392 11.299 1.52206 12.0956 2.21324 12.7868C2.90441 13.4779 3.70098 14.0196 4.60294 14.4118C5.5098 14.8039 6.47549 15 7.5 15ZM6.17647 11.75C6.01961 11.75 5.88726 11.701 5.77941 11.6029C5.67157 11.5 5.61765 11.3701 5.61765 11.2132C5.61765 11.0662 5.67157 10.9412 5.77941 10.8382C5.88726 10.7304 6.01961 10.6765 6.17647 10.6765H7.11029V7.21324H6.30147C6.14951 7.21324 6.01961 7.16422 5.91177 7.06618C5.80392 6.96324 5.75 6.83333 5.75 6.67647C5.75 6.52941 5.80392 6.40441 5.91177 6.30147C6.01961 6.19363 6.14951 6.13971 6.30147 6.13971H7.72794C7.92402 6.13971 8.07108 6.20343 8.16912 6.33088C8.27206 6.45833 8.32353 6.625 8.32353 6.83088V10.6765H9.25735C9.41422 10.6765 9.54657 10.7304 9.65441 10.8382C9.76226 10.9412 9.81618 11.0662 9.81618 11.2132C9.81618 11.3701 9.76226 11.5 9.65441 11.6029C9.54657 11.701 9.41422 11.75 9.25735 11.75H6.17647ZM7.43382 4.88235C7.15931 4.88235 6.92402 4.78677 6.72794 4.59559C6.53677 4.39951 6.44118 4.16422 6.44118 3.88971C6.44118 3.61029 6.53677 3.375 6.72794 3.18382C6.92402 2.98775 7.15931 2.88971 7.43382 2.88971C7.71324 2.88971 7.94608 2.98775 8.13235 3.18382C8.32353 3.375 8.41912 3.61029 8.41912 3.88971C8.41912 4.16422 8.32353 4.39951 8.13235 4.59559C7.94608 4.78677 7.71324 4.88235 7.43382 4.88235Z";

var formCount = 1;
const maxForms = 5;
document.getElementById('addFormBtn').addEventListener('click', addNewForm);

function setDefaultSettings(formId) {
  const checkboxThumbImg = document.getElementById(`checkbox-thumb${formId}`);
  const checkboxFileName = document.getElementById(`checkbox-fileName${formId}`);
  const checkboxNoticeImg = document.getElementById(`checkbox-noticeImg${formId}`);
  const inputFileName = document.getElementById(`inputFileName${formId}`);

  if (checkboxThumbImg && checkboxFileName && checkboxNoticeImg && inputFileName) {
    checkboxThumbImg.checked = true;
    checkboxFileName.checked = true;
    checkboxNoticeImg.checked = true;
    inputFileName.style.backgroundColor = '#d0d0d0';
    inputFileName.style.textDecoration = 'line-through';
  } else {
    console.error(`Error: Form elements not found for formId ${formId}`);
  }
}

function setSvgPaths(formId) {
  document.getElementById(`thumbImgPath${formId}`).setAttribute("d", svgPathData);
  document.getElementById(`noticeImgPath${formId}`).setAttribute("d", svgPathData);
  document.getElementById(`fileNamePath${formId}`).setAttribute("d", svgPathData);
}

async function addNewForm() {
  // if (formCount >= maxForms) return;

  formCount++;
  const formContainer = document.getElementById('formContainer');
  const template = await fetch('/html/form-template.html').then(response => response.text());

  const newForm = document.createElement('div');
  newForm.classList.add('inputForm');
  newForm.innerHTML = template.replace(/{{formId}}/g, formCount);

  formContainer.appendChild(newForm);
  console.log(`New form added with ID: ${formCount}`);
  setDefaultSettings(formCount); // 기본 설정 적용
  setSvgPaths(formCount); // SVG 경로 설정
  addEventListeners(formCount);
}

function addEventListeners(formId) {
  console.log(`Adding event listeners for form ID: ${formId}`);
  const startBtn = document.getElementById(`startBtn${formId}`);
  startBtn.addEventListener('click', async function getImg() {
    let inputData = document.getElementById(`inputUrlBox${formId}`).value;

    // 조건 1: 공백인 경우
    if (!inputData.trim()) {
      handleError(`formID -> ${formId}, 빈 값`, formId);
      return;
    }

    // 조건 2: 숫자가 포함되지 않은 경우
    if (!/\d/.test(inputData)) {
      handleError(`formID -> ${formId}, 숫자가 포함되지 않음`, formId);
      return;
    }

    console.time(`form${formId}`);

    

    console.log(`Input URL data for form ID ${formId}: ${inputData}`);
    const productCode = getNumInString(inputData);
    console.log(`Product code for form ID ${formId}: ${productCode}`);

    const inputURL = `https://domeggook.com/${productCode}`;
    console.log(`입력된 URL for form ID ${formId} => ${inputURL}\n`);

    // 조건 3: 정상적인 링크 형태가 아닌 경우
    if (inputURL == 'https://domeggook.com/') {
      handleError(`formID -> ${formId}, 정상적인 링크 형태가 아님`, formId);
      return;
    }

    document.getElementById(`imgDownBtn${formId}`).style.display = 'none';
    document.getElementById(`parsingLoader${formId}`).style.display = 'inline-block';
    document.getElementById(`downloadStatus${formId}`).classList.add('hidden');

    const webData = new GetInfo(inputURL);
    const response = await webData.getHTMLResponse();

    // 조건 4: 응답 상태 코드가 정상적이지 않은 경우
    if (response.status !== 200 || !response.data) {
      handleError(`formID -> ${formId}, 응답 상태 코드 비정상`, formId);
      return;
    }

    const $ = await webData.getHTML();
    console.log(`typeof = ${typeof $}`);
    console.log($);
    const productName = await webData.getProductName($);

    const getImgSrcSafely = async (webData, $) => {
      try {
        return await webData.getImgSrc($);
      } catch (error) {
        if (error.message.includes('cheerio.load() expects a string')) {
          handleError(`formID -> ${formId}, 유효하지 않은 도매꾹 상품`, formId);
          return null;
        } else {
          console.error(`Error in form ID ${formId}:`, error);
          return null;
        }
      }
    };
    
    const imgList = await getImgSrcSafely(webData, $);
    if (imgList === null) return; // -> 이미 catch로 빠졌음
    
    console.log(`제품명 = ${productName}`);

    const downloadBtn = document.getElementById(`imgDownBtn${formId}`);
    const newDownloadBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

    newDownloadBtn.addEventListener('click', async function() {
      const thumbOption = document.getElementById(`checkbox-thumb${formId}`).checked;
      const noticeImgOption = document.getElementById(`checkbox-noticeImg${formId}`).checked;

      const filteredImgList = imgList.filter(img => {
        if (img.type === 'thumbImg' && thumbOption) return true;
        if (img.type === 'noticeImg' && noticeImgOption) return true;
        if (img.type === 'detailImg') return true;
        return false;
      });

      document.getElementById(`downloadStatus${formId}`).textContent = '압축 중...';
      document.getElementById(`downloadStatus${formId}`).classList.remove('hidden');
      document.getElementById(`downloadStatus${formId}`).classList.remove('fade-out');
      await downZipFile(filteredImgList, productName, formId);
    });

    document.getElementById(`parsingLoader${formId}`).style.display = 'none';
    newDownloadBtn.style.display = 'inline-block';
    console.timeEnd(`form${formId}`);
  });

  const checkboxFileName = document.getElementById(`checkbox-fileName${formId}`);
  const inputFileName = document.getElementById(`inputFileName${formId}`);
  
  checkboxFileName.addEventListener("change", function() {
    if (this.checked) {
      inputFileName.style.backgroundColor = '#d0d0d0';
      inputFileName.style.textDecoration = 'line-through';
    } else {
      inputFileName.style.backgroundColor = '#F5F5F6';
      inputFileName.style.textDecoration = '';
    }
  });

  inputFileName.addEventListener("click", function(){
    checkboxFileName.checked = false;
    this.style.backgroundColor = '#F5F5F6';
    this.style.textDecoration = '';
  });
}

function handleError(message, formId) {
  console.log(message);
  document.getElementById(`parsingLoader${formId}`).style.display = 'none';

  const inputBox = document.getElementById(`inputUrlBox${formId}`);
  const errorMsg = document.getElementById(`errorMsg${formId}`);

  inputBox.setAttribute('style', 'border: 1px solid red !important;');
  errorMsg.classList.remove('hidden');
  errorMsg.style.opacity = 1;

  setTimeout(() => {
    // 원래 스타일로 서서히 복원
    let borderColorChange = setInterval(() => {
      if (inputBox.style.borderColor !== 'black') {
        inputBox.setAttribute("style", "border: '';"); // 원래 스타일로 복원
        clearInterval(borderColorChange);
      }
    }, 50); // 50ms마다 확인

    errorMsg.style.opacity = 0;
    setTimeout(() => {
      errorMsg.classList.add('hidden');
    }, 1000);
  }, 3000);
}


async function downZipFile(imgList, productName, formId) {
  let zipName = '';
  if (document.getElementById(`checkbox-fileName${formId}`).checked) zipName = productName;
  else zipName = document.getElementById(`inputFileName${formId}`).value;

  console.log(`zip 파일명 = ${zipName}`);

  const { handleZip } = useDownload();
  await handleZip(imgList, zipName);
  document.getElementById(`downloadStatus${formId}`).textContent = '다운로드 시작!';
  setTimeout(() => {
    document.getElementById(`downloadStatus${formId}`).classList.add('fade-out');
    setTimeout(() => {
      document.getElementById(`downloadStatus${formId}`).classList.add('hidden');
    }, 1000);
  }, 3000);
}

function checkIfNum(data) {
  let checkIfNum = /^[0-9]+$/; 
  return checkIfNum.test(data);
}

function getNumInString(data) {
  let status = checkIfNum(data);
  let productCode = '';
  if (status == true) {
    productCode = data;
  } else {
    let startProductCode = data.substring(data.search('domeggook.com/') + 14);
    if (startProductCode.includes('?') == true) productCode = startProductCode.substring(0, startProductCode.indexOf('?'));
    else productCode = startProductCode;
  }
  return productCode;
}

// 초기화 및 첫 폼 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
  setDefaultSettings(1);
  setSvgPaths(1);
  addEventListeners(1);
});