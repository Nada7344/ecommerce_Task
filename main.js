let page = 1;
const limit = 6;
let products = [];
let allProducts = [];
const cart = [];

const app = document.querySelector(".app");
const container = document.querySelector('#productsGrid');
const pagination = document.querySelector('#paginate');
const cartItem = document.querySelector('#cartItems');


async function fetchData() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
            console.log('fail to load data');
        }
        data = await response.json();
        allProducts = data;
        products = [...data];
        renderCards(data)
        return data;


    } catch (error) {

        console.error('Error:', error);
    }
}







async function renderCards(data) {

    products = data;

    const start = (page - 1) * limit;
    const end = page * limit;
    const itemsOnPage = products.slice(start, end);


    console.log(data);
    container.innerHTML = '';
    pagination.innerHTML = '';


    if (products.length === 0) {

        container.innerHTML = `
            <p class="no-products">
                No products found
            </p>
        `;

        return;
    }

    itemsOnPage.forEach(item => {

        let card = document.createElement('div');
        card.classList.add('product-card');

        let img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;

        let title = document.createElement('h3');
        title.classList.add('product-name');
        title.textContent = item.title;

        let price = document.createElement('p');
        price.classList.add('product-price');
        price.textContent = '$' + item.price;

        let actions = document.createElement('div');
        actions.classList.add('product-actions');

        let viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'View Details';

        let addToCartBtn = document.createElement('button');
        addToCartBtn.textContent = 'Add to Cart';

        //*************popup**************
        let model = document.createElement('div');
        model.classList.add('card');

        let popupImg = img.cloneNode(true);

        let popupTitle = document.createElement('h2');
        popupTitle.textContent = item.title;

        let description = document.createElement('p');
        description.textContent = item.description;

        let popupPrice = document.createElement('p');
        popupPrice.textContent = '$' + item.price;

        let rating = document.createElement('p');
        rating.textContent = `Rating: ${item.rating.rate} (${item.rating.count} reviews)`;

        let category = document.createElement('p');
        category.textContent = `category :${item.category}`;

        let closeBtn = document.createElement('button');
        closeBtn.classList.add('btn-close');
        closeBtn.textContent = '✖';

        closeBtn.addEventListener('click', function () {
            model.classList.remove('open-popup');
        });

        model.appendChild(closeBtn);
        model.appendChild(popupImg);
        model.appendChild(popupTitle);
        model.appendChild(description);
        model.appendChild(category);
        model.appendChild(popupPrice);
        model.appendChild(rating);


        viewDetailsBtn.addEventListener('click', function () {
            model.classList.add('open-popup');
        });

        addToCartBtn.addEventListener('click', function () {

            const existingProduct = cart.find(
                cartItem => cartItem.id === item.id
            );

            if (existingProduct) {

                existingProduct.quantity++;

            } else {

                cart.push({
                    ...item,
                    quantity: 1
                });

            }

            addToCartFunction();
        });
        actions.appendChild(viewDetailsBtn);
        actions.appendChild(addToCartBtn);

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(actions);

        container.appendChild(card);
        document.body.appendChild(model);
    });


    // Prev button
    if (page > 1) {
        const prev = createPaginationButton("Previous", () => selectPageHandler(page - 1));
        pagination.appendChild(prev);
        prev.classList.add("navBtn")

    }

    // Page number buttons
    for (let i = 1; i <= totalPages(); i++) {
        pagination.appendChild(
            createPaginationButton(i, () => selectPageHandler(i), page === i)
        );
    }

    //Next button
    if (page < totalPages()) {
        const next = createPaginationButton("Next", () => selectPageHandler(page + 1));
        pagination.appendChild(next);
        next.classList.add("navBtn")
    }


 


}

function addToCartFunction() {

    cartItem.innerHTML = '';

    cart.forEach((item) => {

        let li = document.createElement("li");

        li.innerHTML = `
            ${item.title} - $${item.price}  ${item.quantity}
            <button onclick="removeFromCart(${item.id})">
                remove
            </button>
        `;

        cartItem.appendChild(li);
    });

    calculateTotal();
}

function removeFromCart(id) {

    const index = cart.findIndex(item => item.id === id);

    if (index === -1) return;

    if (cart[index].quantity === 1) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity--;
    }

    addToCartFunction();
}


let totalQuantity = document.getElementById('totalQuantity')
let totalPrice = document.getElementById('totalPrice')

function calculateTotal() {
    let totalQ = cart.reduce((acc, ele) => acc + ele.quantity, 0)
    let totalP = cart.reduce((acc, ele) => acc + (ele.price * ele.quantity), 0)
    totalQuantity.textContent = totalQ
    totalPrice.textContent = totalP.toFixed(2)

}

function createPaginationButton(text, handler, isSelected) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.onclick = handler;

    if (isSelected) {
        btn.classList.add("pagination__selected");
    }

    return btn;
}

async function selectPageHandler(selectedPage) {
    if (
        selectedPage >= 1 &&
        selectedPage <= totalPages() &&
        selectedPage !== page
    ) {
        page = selectedPage;
        renderCards(products);
    }
}

function totalPages() {
    return Math.ceil(products.length / limit);
}


document.addEventListener("DOMContentLoaded", async function () {
    await fetchData()
});



document.getElementById("applyFiltersBtn").addEventListener("click", () => {

    const searchInput = document.getElementById("searchInput").value.toUpperCase();
    const minInput = parseFloat(document.getElementById("minPrice").value);
    const maxInput = parseFloat(document.getElementById("maxPrice").value);
    const category = document.getElementById("categorySelect").value;
    const sort = document.getElementById("sortSelect").value;

    let filtered = [...allProducts];

    

    if (category !== "all") {
        filtered = filtered.filter(item =>
            item.category === category
        );
    }

    if (searchInput) {
        filtered = filtered.filter(item =>
            item.title.toUpperCase().includes(searchInput)
        );
    }

     if (
        !isNaN(minPrice) &&
        !isNaN(maxPrice) &&
        minPrice > maxPrice
    ) {

        alert(
            "Minimum price cannot be greater than maximum price."
        );

        return;
    }
    
    if (!isNaN(minInput)) {
        filtered = filtered.filter(item =>
            item.price >= minInput
        );
    }

    if (!isNaN(maxInput)) {
        filtered = filtered.filter(item =>
            item.price <= maxInput
        );
    }




    // Sorting
    filtered = sortProducts(filtered, sort)



    page = 1;
    renderCards(filtered);
});




function sortProducts(products, sortType) {

    const sortedProducts = [...products];

    switch (sortType) {

        case "price":
            return sortedProducts.sort(
                (a, b) => a.price - b.price
            );

        case "name":
            return sortedProducts.sort(
                (a, b) => a.title.localeCompare(b.title)
            );

        case "rate":
            return sortedProducts.sort(
                (a, b) => b.rating.rate - a.rating.rate
            );

        default:
            return sortedProducts;
    }
}








