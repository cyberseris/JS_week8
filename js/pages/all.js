function showProducts(data){
  let list = '';
  data.forEach(item=>{
      list+=`<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">${toThousands(item.origin_price)}</del>
                <p class="nowPrice">${toThousands(item.price)}</p>
            </li>`
  })
  productList.innerHTML = list;
}

async function addCart(dataId){
  const cartsResponse = await axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`);
  const cartItems = cartsResponse.data.carts;
  let filterItem = Array.isArray(cartItems) 
  ? cartItems.filter(function(item) {
    return item.product.id === dataId;
  }) 
  : [];
  const addCartsResponse = await axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": dataId,
      "quantity": filterItem.length===0?1:filterItem[0].quantity+1
    }
  })
  getCartList();
}

function showCartList(cartItems){
    let list = '';
    let totalPrice = 0;
    let cartLength =  cartItems.length;
    
    if(cartLength){
     list += ` <tr>
               <th width="40%">品項</th>
               <th width="15%">單價</th>
               <th width="15%">數量</th>
               <th width="15%">金額</th>
               <th width="15%"></th>
            </tr>`
    cartItems.forEach(item =>{
      totalPrice += item.product.price*item.quantity;
      list += ` <tr>
                      <td>
                          <div class="cardItem-title">
                              <img src="https://i.imgur.com/HvT3zlU.png" alt="">
                              <p>${item.product.title}</p>
                          </div>
                      </td>
                      <td>${toThousands(item.product.price)}</td>
                      <td>${item.quantity}</td>
                      <td>${toThousands(item.product.price*item.quantity)}</td>
                      <td class="discardBtn">
                          <a href="#" class="material-icons deleteCartItemBtn" data-id="${item.id}">
                              clear
                          </a>
                      </td>
                  </tr>`  
      })

      list += `<tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${toThousands(totalPrice)}</td>
                </tr>`       
      
      cartList.innerHTML = list;     
    }else{
      cartList.innerHTML = '<tr>目前購物車沒有任何東西</tr>'; 
    }
    

}

async function getCartList(){
  await axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(response){
    const cartList = response.data.carts;
    showCartList(cartList);
    
    const clearBtn = document.querySelectorAll(".deleteCartItemBtn");
    const discardAllBtn = document.querySelector(".discardAllBtn");
    
    for(let i=0;i<clearBtn.length;i++){
       clearBtn[i].addEventListener('click', function(e){
         e.preventDefault();
         deleteCartItem(e.target.dataset.id);
      }) 
    }
    
    discardAllBtn.addEventListener('click', function(e){
      e.preventDefault();
      deleteAllCartItems();
    })
  })
  .catch((error) => { console.log("getCartList error: ", "購物車為空"); });
}
 
function deleteCartItem(itemId){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${itemId}`)
  .then(function(response){
    getCartList();
  })
}

function deleteAllCartItems(){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(response){
    getCartList();
  })  
  .catch((error) => { console.log("deleteAllCartItems error: ", error); });
}

function filterProducts(){
  productSelect.addEventListener('change', function(e){
    const category = e.target.value
    if(category=="全部"){
      getProducts("全部");
    }else if(category=="床架"){
      getProducts("床架");
    }else if(category=="收納"){
      getProducts("收納");
    }else if(category=="窗簾"){
      getProducts("窗簾");
    }
  })  
}

async function getProducts(productSelectValue){
  await axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
    if(productSelectValue == "全部"){
        const data = response.data.products;
        showProducts(data);        
    }else{
      const data = response.data.products.filter(item=>item.category==productSelectValue);
      showProducts(data);      
    }
    
    const addBtn = document.querySelectorAll('.addCardBtn')
    for(let i=0;i<addBtn.length;i++){
      addBtn[i].addEventListener('click', function(e){
        e.preventDefault();
        addCart(e.target.dataset.id);
      })
    }
  })
    .catch((error) => { console.log("getProducts error: ", error); });
  }

async function submitOrders(){
  try{
     const cartResponse = await axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`);

    if(cartResponse.data.carts && cartResponse.data.carts.length>0){
      const orderResponse = await axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        data: {
          user: {
            name: customerName.value,
            tel: customerPhone.value,
            email: customerEmail.value,
            address: customerAddress.value,
            payment: tradeWay.value
          }
        }
      });
      getCartList();
      orderInfoForm.reset()
    }else{
      console.log("購物車是空的，請先加入商品！");
    }     

     }catch(error){
      console.log("submitOrders error: ", error);
    }
}

function toThousands(num){
  return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

const name = document.querySelector("[data-message='姓名']");
const tel = document.querySelector("[data-message='電話']");
const email = document.querySelector("[data-message='Email']");
const address = document.querySelector("[data-message='寄送地址']");
const customerName = document.querySelector("#customerName");
const customerTel = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const submitBtn = document.querySelector(".orderInfo-btn");
const productList = document.querySelector(".productWrap");
const cartList = document.querySelector(".shoppingCart-table");
const productSelect = document.querySelector(".productSelect");
const orderInfoForm = document.querySelector(".orderInfo-form");
let productSelectValue = "全部";

getProducts(productSelectValue);
getCartList();
filterProducts();

submitBtn.addEventListener('click', function(e){
  e.preventDefault();
  name.textContent = "必填";
  tel.textContent = "必填";
  email.textContent = "必填";
  address.textContent = "必填";

  if(!customerName.value){
    name.textContent = "姓名是必填欄位";
    return
  }
  if(!customerPhone.value){
    tel.textContent = "電話是必填欄位";
    return
  }
  if(!customerEmail.value){
    email.textContent = "信箱是必填欄位";
    return
  }
  if(!customerAddress.value){
    address.textContent = "地址是必填欄位";
    return
  }

  submitOrders();
})


document.addEventListener('DOMContentLoaded', function(e) {
  e.preventDefault();
  const ele = document.querySelector('.recommendation-wall');
  ele.style.cursor = 'grab';
  let pos = { top: 0, left: 0, x: 0, y: 0 };
  const mouseDownHandler = function(e) {
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';

      pos = {
          left: ele.scrollLeft,
          top: ele.scrollTop,
          // Get the current mouse position
          x: e.clientX,
          y: e.clientY,
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
  };
  const mouseMoveHandler = function(e) {
      // How far the mouse has been moved
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;

      // Scroll the element
      ele.scrollTop = pos.top - dy;
      ele.scrollLeft = pos.left - dx;
  };
  const mouseUpHandler = function() {
      ele.style.cursor = 'grab';
      ele.style.removeProperty('user-select');

      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
  };
  // Attach the handler
  ele.addEventListener('mousedown', mouseDownHandler);
});
// menu 切換
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener('click', closeMenu);
})

function menuToggle() {
  if(menu.classList.contains('openMenu')) {
      menu.classList.remove('openMenu');
  }else {
      menu.classList.add('openMenu');
  }
}
function closeMenu() {
  menu.classList.remove('openMenu');
}