// vars globales
var str = window.location.href;
var url = new URL(str);
var id = url.searchParams.get("id");
var product;

var cmdArticle ;
var is_basket_empty;



var basket= [];

var nbArticle;
var colorArticle;
var btnAddToCart;

const min_qty_article = 1;
const max_qty_article = 100;



//---------- fonctions

// point d'entrée au chargement de la page sélection d'un canapé
function main()
{
    
    nbArticle = document.getElementById("quantity");
    colorArticle = document.getElementById("colors");
    btnAddToCart = document.getElementById("addToCart");
    
    //-------- ajout listener pou validation/confirmation commande
    nbArticle.addEventListener("change",enable_btn_add_to_cart);
    nbArticle.addEventListener("keyup",enable_btn_add_to_cart);
    colorArticle.addEventListener("change",enable_btn_add_to_cart);
    btnAddToCart.addEventListener("click", gest_cmd_basket);
    
    load_item_by_id();
    dsp_cart_shopping();
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

// Fonction permettant de recuperer dans la BDD du serveur 
// les datas du produit selectionné dans la page accueil
function load_item_by_id()
{
    fetch("http://localhost:3000/api/products/"+id)
    .then(function(res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function(value) { 
        product = value;
        //console.log( "load_item_by_id "+product['name'])
        show_item(product);
    })
    .catch(function(err) {
        console.error(err);
        
    });
}

// fonction permettant l'autorisation de l ajout/update d'une commande
// avec le bouton "ajout commande"
function enable_btn_add_to_cart()
{

    if (   ( colorArticle.value.length>0           )&&     // 1 couleur choisie
    ( parseInt(nbArticle.value      ) > 0   && parseInt(nbArticle.value      ) <= 100 )   )   // qty valide
    {
        btnAddToCart.disabled = false;
    }
    else{
        btnAddToCart.disabled = true;
    }
}

// Premet l affichage dynamique d'un item avec des datas spécifiques 
// couleurs de l 'article
// nbre d'article
function show_item(myproduct)
{
    let title = document.getElementById('title');
    title.textContent=myproduct['name'];
    let price = document.getElementById('price');
    price.textContent=myproduct['price'];
    let description = document.getElementById('description');
    description.textContent=myproduct['description'];
    
    let colors = document.getElementById('colors');
    
    myproduct['colors'].forEach(color => {
        let option = document.createElement("option");
        option.textContent = color;
        colors.appendChild(option);
    });
    
    document.getElementById('title_head').textContent = title.textContent
    
}

// cette fonction crée la premiere commande 
// ecriture - sauvegarde dans le localStorage
function create_first_cmd(cmd_article)
{
    basket.push(cmd_article);
    let basketLinea = JSON.stringify(basket);
    localStorage.setItem("basket",basketLinea);
}

// cette fonction permet la création de commande 
// lecture - ecriture - sauvegarde dans le localStorage

function create_cmd(cmd_article)
{
    // test de la presence d'au moins un article dans le panier
    if( !is_basket_empty )
    {
        // lecture
        basket = JSON.parse(localStorage.getItem("basket"));
        // ecriture
        basket.push(cmd_article);
        let basketLinea = JSON.stringify(basket);
        localStorage.setItem("basket",basketLinea);
    }
    
    
}

// cette fonction permet la mise à jour d'une commande existante meme produit et meme couleur
// lecture - ecriture - sauvegarde dans le localStorage

function update_cmd(cmdArticle)
{
    if( !is_basket_empty) // au moins une article
    {
        basket = JSON.parse(localStorage.getItem("basket"));
        
        for (let article of basket) {
            // si meme id et meme couleur il faut faire un update 
            if(article.id == cmdArticle.id &&  article.color == cmdArticle.color) 
            {
                // mise à jour nombre d'article 
                article.nb = (parseInt(cmdArticle.nb,10) +  parseInt(article.nb,10)).toString();
                localStorage.setItem("basket",JSON.stringify(basket));
                return false; // doublon trouvé pas de creation commande 
                
            }
        }
        
    }
    return true;
}

// fonction qui permet l 'ajout de commande au panier ou la mise à jour d'un nombre d'article si la commande exite déja
function gest_cmd_basket(e)
{
    
    let cmd_article_ok = new Boolean(false);
    is_basket_empty = (localStorage.getItem("basket") == null)?true:false;
    //console.log("add basket")
    //console.log(nbArticle.value)
    //console.log("article color : "+colorArticle.value)
    //console.log("article id :"+product['_id'])
    
    cmdArticle=
    {
        id:product['_id'],
        color:colorArticle.value,
        nb:nbArticle.value,
    }
    
    
    
    cmd_article_ok = (cmdArticle.nb.length > 0 && parseInt(cmdArticle.nb,10) > 0 && cmdArticle.color.length > 0);
    
    if(  cmd_article_ok )
    {
        //console.log("cmdArticle.id : "+cmdArticle.id+" cmdArticle.nb : "+cmdArticle.nb+" cmdArticle.color : "+cmdArticle.color)
        //console.log("commande correcte!")
        // init 
        
        // update or create 
        let create_cmd_to_do = update_cmd(cmdArticle);
        
        // creation commande
        if(create_cmd_to_do)
        {
            if(!is_basket_empty)
            {
                create_cmd_to_do = false;
                create_cmd(cmdArticle);
            }
            else
            {
                create_first_cmd(cmdArticle);
            }
        } 
    }
    
    dsp_cart_shopping();
}

//--- main appel au chargement / rafraichissement de la page
main();




