import { GetInfo } from "/function-domeggook.js"; 
import { useDownload } from "/zipImages.js"; 

var formCount = 1;
const maxForms = 5;
document.getElementById('addFormBtn').addEventListener('click', addNewForm);

function setDefaultSettings(formId) {
  const checkboxThumbImg = document.getElementById(`checkbox-thumb${formId}`);
  const checkboxFileName = document.getElementById(`checkbox-fileName${formId}`);
  const checkboxNoticeImg = document.getElementById(`checkbox-noticeImg${formId}`);
  const inputFileName = document.getElementById(`inputFileName${formId}`);

  checkboxThumbImg.checked = true;
  checkboxFileName.checked = true;
  checkboxNoticeImg.checked = true;
  inputFileName.style.backgroundColor = '#d0d0d0';
  inputFileName.style.textDecoration = 'line-through';
}

function addNewForm() {
  if (formCount >= maxForms) return;

  formCount++;
  const formContainer = document.getElementById('formContainer');

  const newForm = document.createElement('div');
  newForm.classList.add('inputForm');
  newForm.innerHTML = `
    <form>
      <div class="inputURL">
        <span><input type="text" class="inputBox" id="inputUrlBox${formCount}" placeholder="링크 or 상품코드"></span>
        <span><input type="button" class="startBtn" id="startBtn${formCount}" value="시작!"></span>
      </div>
      <div class="optionContainer">
        <label for="imgSelect" id="optionWrap">
          <p id="optionInfoText">포함시킬 사진</p>   
          <input type="checkbox" id="checkbox-thumb${formCount}" class="option_checkbox">
          <label for="checkbox-thumb${formCount}" class="option_checkbox_text">썸네일 포함</label>   

          <label for="info_text_label" class="info_text_label" id="info_text_label-thumbImg${formCount}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" class="ico_more_info">
              <path class="infoIcon" id="thumbImgPath${formCount}" fill="#9DA9B8" d=""/>
            </svg>
            <p class="info_text">대표 이미지를 포함하여<br>다운로드합니다.</p>
          </label>
          
          <input type="checkbox" id="checkbox-noticeImg${formCount}" class="option_checkbox">
          <label for="checkbox-noticeImg${formCount}" class="option_checkbox_text">공급사 공지 이미지 포함</label> 

          <label for="info_text_label" class="info_text_label" id="info_text_label-noticeImg${formCount}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" class="ico_more_info">
              <path class="infoIcon" id="noticeImgPath${formCount}" fill="#9DA9B8" d=""/>
            </svg>
            <p class="info_text">공급사 공지 사진을 포함하여<br>다운로드합니다. (주로 직구 상품)</p>
          </label>
        </label> 

        <label for="preference" id="optionWrap">
          <p id="optionInfoText">다운로드 설정</p>   

          <input type="checkbox" id="checkbox-fileName${formCount}" class="option_checkbox"> 
          <label for="checkbox-fileName${formCount}" class="option_checkbox_text">상품명.zip으로 저장</label>   
          <label for="info_text_label" class="info_text_label" id="info_text_label-fileName${formCount}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" class="ico_more_info">
              <path class="infoIcon" id="fileNamePath${formCount}" fill="#9DA9B8" d=""/>
            </svg>
            <p class="info_text">도매 사이트의 상품 이름으로<br>파일명을 저장합니다.</p>
          </label>

          <label for="filename_input_area">
            <p class="text-1">또는</p>
            <input type="text" class="inputFileName" id="inputFileName${formCount}" placeholder="파일 이름 입력 (클릭)">
            <p class="text-2" style="left: -26px;">.zip</p>
          </label>
        </label>
      </div>
    </form>
    <section class="imgDownArea">
      <div class="parsingLoader" id="parsingLoader${formCount}"></div>
      <div class="imgDown">
        <div><input type="button" class="imgDownBtn" id="imgDownBtn${formCount}" value="다운로드!"></div>
        <div id="downloadStatus${formCount}" class="hidden"></div>
      </div>
    </section>
  `;

  formContainer.appendChild(newForm);
  console.log(`New form added with ID: ${formCount}`);
  setDefaultSettings(formCount); // 기본 설정 적용
  addEventListeners(formCount);
}

function addEventListeners(formId) {
  console.log(`Adding event listeners for form ID: ${formId}`);
  const startBtn = document.getElementById(`startBtn${formId}`);
  startBtn.addEventListener('click', async function getImg() {
    console.time();
    document.getElementById(`imgDownBtn${formId}`).style.display = 'none';
    document.getElementById(`parsingLoader${formId}`).style.display = 'none';
    document.getElementById(`parsingLoader${formId}`).style.display = 'inline-block';
    document.getElementById(`downloadStatus${formId}`).classList.add('hidden');

    let inputData = document.getElementById(`inputUrlBox${formId}`).value;
    console.log(`Input URL data for form ID ${formId}: ${inputData}`);
    const productCode = getNumInString(inputData);
    console.log(`Product code for form ID ${formId}: ${productCode}`);

    const inputURL = `https://domeggook.com/${productCode}`;
    console.log(`입력된 URL for form ID ${formId} => ${inputURL}\n`);

    let imgList = [];

    const webData = new GetInfo(inputURL);
    const $ = await webData.getHTML();
    console.log(`typeof = ${typeof $}`);
    console.log($);
    const productName = await webData.getProductName($);
    const newImgList = await webData.getImgSrc($);

    console.log(`제품명 = ${productName}`);

    imgList = newImgList;

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
    console.timeEnd();
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
setDefaultSettings(1);
addEventListeners(1);
