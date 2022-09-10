// vars globales
var items;

//------------------------------------------------------- functions
// point d'entrée au chargement de la page liste des canapés
function main()
{
  load_items();

  dsp_cart_shopping();
}

 // Affichage dynamique des produits de la BDD contenu sur le serveur
// via l 'API grace à un fetch
function load_items()
{
  //console.log(process.env.)
  fetch('https://beige-giraffe-tux.cyclic.app/api/products')
  //fetch("http://localhost:3000/api/products/")
  .then(function(res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function(value) { 
    items = value;
   // console.log( items.length)
   display_items(items);
  })
  .catch(function(err) {
    console.error(err)
  });
}

// Permet l'affichage dynamique des items chargés
function display_items(items) 
{
  let articles = document.getElementById('items');
  
  items.forEach(item => {
    let urlArticle = document.createElement("a")
    let article = document.createElement("article");
    let img = document.createElement("img");
    let h3 = document.createElement("h3");
    let p  = document.createElement("p");
    
    img.src = item['imageUrl'];
    img.alt = item['altTxt'];
    h3.classList.add("productName");
    h3.textContent = item['name'];
    p.classList.add("productDescription");
    p.textContent = item['description'];
    
    article.appendChild(img);
    article.appendChild(h3);
    article.appendChild(p);
    urlArticle.appendChild(article);
    
    urlArticle.href="html/product.html?id="+item['_id'];  

    articles.appendChild(urlArticle);
    
  });
}

// Permet l' affichage d'une icone cart-shopping a droite de l'intitulé panier du menu navigation
// si au moins un article dans le panier
function dsp_cart_shopping()
{
    document.getElementById('cart_shopping').style.visibility = 'hidden';
    if( localStorage.getItem("basket") != null)
    {
        document.getElementById('cart_shopping').style.visibility = 'visible';
    }
}

//--- main appel au chargement / rafraichissement de la page
main();













