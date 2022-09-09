//------------------------------------------------------------------ var globales + const 
const UPDATE_TOTAL_PRICE = 0;
const ORDER_NO_VALID = 0;
const ORDER_VALID = 1;
const MIN_QTY = 1;
const MAX_QTY = 100;

var price_updated = 0;
var nb_cmd_price = 0;
var totalPrice = 0;
var nb_cmd_storage = 0;
var cart_updated  = 0;
var products_id= [];
var commandeFinale;

const REGEX_FIRST_NAME  = /^([A-Za-z '-]){1,24}$/;
const REGEX_LAST_NAME   = /^([A-Za-z '-]){1,36}$/;
const REGEX_ADRESS      = /^([A-Za-z0-9 '-]){1,48}$/;
const REGEX_CITY        = /^([A-Za-z '-]){1,36}$/;
const REGEX_EMAIL       = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})$/;

var btnCmd = document.getElementById('order');


//------------------------------------------------------------------- listeners
// validation champs formulaires 
// firstName
// masque : des lettres minuscules ou majuscules 
// 1 car minimum
// 24 car max
firstName.addEventListener('change', function(e) {
    //console.log( "firstName.value : "+ firstName.value)
    let field_first_name = firstName.value;
    let p0 = document.getElementById('firstNameErrorMsg');
    p0.textContent="";
    
    if(!field_first_name.match(REGEX_FIRST_NAME) &&  field_first_name.length>0)
    {
        p0.textContent = "format invalide !";
    }
    enable_btn_cmd();
});

// lastName
// masque : des lettres minuscules ou majuscules 
// car supplementaires : espace + apostrophe + tiret 
// 1 car minimum
// 36 car max
lastName.addEventListener('change', function(e) {
    //console.log( "lastName.value : "+ lastName.value)
    let field_last_name = lastName.value;
    let p0 = document.getElementById('lastNameErrorMsg');
    p0.textContent="";
    
    if(!field_last_name.match(REGEX_LAST_NAME) &&  field_last_name.length>0)
    {
        p0.textContent = "format invalide !";
    }
    enable_btn_cmd();
});

// adress
address.addEventListener('change', function(e) {
    //console.log( "address.value : "+ address.value)
    let field_address = address.value;
    let p0 = document.getElementById('addressErrorMsg');
    p0.textContent="";
    
    if(!field_address.match(REGEX_ADRESS) &&  field_address.length>0)
    {
        p0.textContent = "format invalide !";
    }
    enable_btn_cmd();
});


// city
city.addEventListener('change', function(e) {
    //console.log( "city.value : "+ city.value)
    let field_city = city.value;
    let p0 = document.getElementById('cityErrorMsg');
    p0.textContent="";
    
    if(!field_city.match(REGEX_CITY) &&  field_city.length>0)
    {
        p0.textContent = "format invalide !";
    }
    enable_btn_cmd();
});


// email
// https://www.w3resource.com/javascript/form/email-validation.php
email.addEventListener('change', function(e) {
    //console.log( "email.value : "+ email.value)
    let field_email = email.value;
    let p0 = document.getElementById('emailErrorMsg');
    p0.textContent="";
    
    if(!field_email.match(REGEX_EMAIL))
    {
        p0.textContent = "format invalide !";
    }
    
    enable_btn_cmd();
    
});

form_commande.onsubmit = () =>
{
    get_order();  
    return false;
}


//-------------------------------------------------------------- functions
// point d'entrée au chargement de la page
// chargement / affichage du panier
function main(){
    
    load_produit();
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

// Cette fonction permet de valider une commande si le formulaire est bien rempli 
function enable_btn_cmd()
{
    
    // lecture champs contacts
    let firstName = document.getElementById('firstName').value.match(REGEX_FIRST_NAME);
    let lastName  = document.getElementById('lastName').value.match(REGEX_LAST_NAME);
    let address   = document.getElementById('address').value.match(REGEX_ADRESS);
    let city      = document.getElementById('city').value.match(REGEX_CITY);
    let email     = document.getElementById('email').value.match(REGEX_EMAIL);
    
    btnCmd.disabled = true;
    if( firstName && lastName && address && city && email)
    {
        btnCmd.disabled = false;
    }
    
}

//------------------------------ fonction permettant la lecture des commandes panier
// et la mise à jour du tab : products_id ce tableau est transmis lors de la requete api 
// pour la création de la commande
function order_product_id()
{
    let basket = JSON.parse(localStorage.getItem("basket"));
    
    // mise à jour Tableau des produits
    for( let cmd = 0; cmd < basket.length && basket; cmd++){
        products_id[cmd] = basket[cmd].id;
    }
}

//------------------------------  fonction de debug/log des paramétres passer à la requete api pour creer la commande
function log_commande()
{
    console.log("###################### LOG COMMANDE  ###############################################")
    console.log( "firstName :"+commandeFinale.contact.firstName)
    console.log( "lastName :"+commandeFinale.contact.lastName)
    console.log( "address :"+commandeFinale.contact.address)
    console.log( "city :"+commandeFinale.contact.city)
    console.log( "email :"+commandeFinale.contact.email)
    
    for (var product of commandeFinale.products) {
        console.log("product id :" + (product) );
    }
    console.log("#####################################################################################")
}

//------------------------------  fonction permettant de tester la validité de la commande
// formulaire correct
// au moins un id article 
function set_commande()
{
    let order_validity = ORDER_NO_VALID;
    
    order_product_id();
    
    commandeFinale = {
        contact: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            email: document.getElementById('email').value,
        },
        products: products_id,
    };
    
    if ( commandeFinale.products.length > 0  )
    {
        order_validity = ORDER_VALID;
    }
    
    return order_validity;
}


//------------------------------ fonction permettant la création de la commande finale client
// test commande valide
// requete api 
function get_order(){ 
    let validity = set_commande();
    
    log_commande();
    
    if( validity ==  ORDER_VALID) 
    {
        
        // Validation des données
        // Pour les routes POST, l’objet contact envoyé au serveur doit contenir les champs firstName,
        // lastName, address, city et email. Le tableau des produits envoyé au back-end doit être un
        // array de strings product-ID. Les types de ces champs et leur présence doivent être validés
        // avant l’envoi des données au serveur.
        
        fetch("http://localhost:3000/api/products/order", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(commandeFinale),
    })
    .then(function(res) {
        //console.log("promesse order callback 1")
        if (res.ok) {
            
            return res.json();
        }
    })
    .then((data) => {
        //console.log("promesse order callback 2")
        // envoyé à la page confirmation, autre écriture de la valeur "./confirmation.html?commande=${data.orderId}"
        window.location.href = `./confirmation.html?commande=${data.orderId}`;
    })
    .catch(function (err) {
        alert("erreur");
    });
}
}

//------------------------------ fonction permettant le calcul du prix total du panier
function total_price(param)
{
    // vars locales
    let cmdLinea;
    let cmdJson;
    let id_article;
    let nb_article;
    
    let basket = JSON.parse(localStorage.getItem("basket"));
    let elt =  document.getElementById("totalPrice");
    
    
    if( param ==  UPDATE_TOTAL_PRICE )
    {
        totalPrice = 0;
        price_updated = 0;
        nb_cmd_price = 0;
    }
    
    
    if(basket)
    {
        if( nb_cmd_price < basket.length)
        {
            //Recherche id et nb articles dans les commandes pour la mise à jour du prix panier
            id_article =  basket[nb_cmd_price].id;
            nb_article =  parseInt(basket[nb_cmd_price].nb,10); 
            
            // verification de la quantité ce cas ne doit pas se produire 
            // sécurité
            if ( nb_article <1 || nb_article > 100)
            {
                return; // annulation mise a jour prix panier
            }
        }
        else
        {
            price_updated = 1;
            elt.textContent = totalPrice.toString(); 
        }
        
        
        if( price_updated == 0)
        {   
            fetch("http://localhost:3000/api/products/"+id_article)
            .then(function(res) {
                if (res.ok) {
                    return res.json();
                }
            })
            .then(function(value) { 
                product = value;
                //console.log( "get_product_price "+product['price'])
                let price_article =  product['price'];
                totalPrice = totalPrice + (price_article * nb_article);
                //console.log(" price_article :" + price_article + " nb_article : "+ nb_article + " id_article : " + id_article)
                //console.log(" totalPrice :" + totalPrice.toString())
                nb_cmd_price++; 
                total_price();            
            })
            .catch(function(err) {
                console.error(err)
            });
        }
        
    }
    else{
        elt.textContent = totalPrice.toString();
    }
    
}
//------------------------------fonction de chargement des articles du panier 
// requete sur l api pour recuperer le prix de l'article
function load_produit()
{
    let id_article;
    
    let basket = JSON.parse(localStorage.getItem("basket"));
    
    if( (basket && basket.length > 0) && (nb_cmd_storage < basket.length ))
    {
        //Recherche id et nb articles dans les commandes pour la mise à jour du prix panier
        id_article =  basket[nb_cmd_storage].id;
    }
    else
    {
        cart_updated = 1;
        
        // Mise à jour prix panier
        total_price(UPDATE_TOTAL_PRICE);
    }
    
    if( cart_updated == 0)
    {  
        //console.log("fonction load_produit fetch url : "+"http://localhost:3000/api/products/"+id_article)
        fetch("http://localhost:3000/api/products/"+id_article)
        .then(function(res) {
            if (res.ok) {
                return res.json();
            }
        })
        .then(function(value) { 
            //console.log( value['name'])
            showCart(value, basket[nb_cmd_storage]);
            nb_cmd_storage++;
            load_produit();
        })
        .catch(function(err) {
            console.error(err)
        });
    }
}
//------------------------------ fonction d'affichage dynamique des articles du panier
function showCart(product,cmdJson) 
{
    //console.log("appel fct showCart")
    
    let cart__items = document.getElementById('cart__items');
    
    //(" name item : "+ product['name'])
    
    let cart__item = document.createElement("article");
    let cart__item__img = document.createElement("div");
    let img__product = document.createElement("img");
    let cart__item__content = document.createElement("div");
    let cart__item__content__description = document.createElement("div");
    let nom_du_produit = document.createElement("h2");
    let couleur_du_produit  = document.createElement("p");
    let prix_du_produit = document.createElement("p");
    let cart__item__content__settings = document.createElement("div");
    let cart__item__content__settings__quantity = document.createElement("div");
    let qty = document.createElement("p");
    let itemQuantity = document.createElement("input");
    //ajout listener
    itemQuantity.addEventListener('change', updateNbArticle);
    itemQuantity.setAttribute("data-id",cmdJson.id);
    itemQuantity.setAttribute("data-color",cmdJson.color);
    let cart__item__content__settings__delete = document.createElement("div");
    let deleteItem = document.createElement("p");
    deleteItem.addEventListener('click',delete_article);
    
    cart__item.classList.add("cart__item");
    cart__item.setAttribute("data-id",cmdJson.id);
    cart__item.setAttribute("data-color",cmdJson.color);
    
    cart__item__img.classList.add("cart__item__img");
    img__product.src = product['imageUrl'];
    img__product.alt = product['altTxt'];
    
    cart__item__content.classList.add("cart__item__content");
    cart__item__content__description.classList.add("cart__item__content__description");
    nom_du_produit.textContent=product['name'];
    couleur_du_produit.textContent=cmdJson.color;
    prix_du_produit.textContent=product['price'];
    
    cart__item__content__settings.classList.add("cart__item__content__settings");
    cart__item__content__settings__quantity.classList.add("cart__item__content__settings__quantity");
    qty.textContent="Qté";
    
    itemQuantity.type="number";
    itemQuantity.classList.add("itemQuantity");
    itemQuantity.min="1";
    itemQuantity.max="100";
    itemQuantity.name="itemQuantity";
    itemQuantity.value=cmdJson.nb;
    
    cart__item__content__settings__delete.classList.add("cart__item__content__settings__delete");
    deleteItem.classList.add("deleteItem");
    deleteItem.textContent="Supprimer";
    
    cart__item.appendChild(cart__item__img);
    cart__item.appendChild(cart__item__content);
    
    cart__item__img.appendChild(img__product);
    cart__item__content.appendChild(cart__item__content__description);
    cart__item__content.appendChild(cart__item__content__settings);
    
    cart__item__content__description.appendChild(nom_du_produit);
    cart__item__content__description.appendChild(couleur_du_produit);
    cart__item__content__description.appendChild(prix_du_produit);
    
    cart__item__content__settings.appendChild(cart__item__content__settings__quantity);
    cart__item__content__settings__quantity.appendChild(qty);
    cart__item__content__settings__quantity.appendChild(itemQuantity);
    
    cart__item__content__settings.appendChild(cart__item__content__settings__delete);
    cart__item__content__settings__delete.appendChild(deleteItem);
    
    cart__items.appendChild(cart__item);
    
}
// fonction permettant la suppression d'un article du panier
function delete_article(e)
{
    //console.log("appel fct delete article")
    
    // Renvoie le plus proche ancêtre qui est un article
    // et dont l'élément parent est section.
    let cart__item = e.target.closest("section > article");
    
    // Renvoie le plus proche ancêtre qui est une section
    // et dont l'élément parent est section.
    let cart__items = e.target.closest("section > section");
    
    try
    {
        // mise à jour localStorage
        let id_article = cart__item.attributes['data-id'].value;
        //console.log("id_article : "+id_article)
        let id_color   = cart__item.attributes['data-color'].value;
        //console.log("id_color : "+id_color)
        // delete commande du localStorage
        let basket = JSON.parse(localStorage.getItem("basket"));
        if( basket )
        {
            if( basket.length == 1  )
            {
                localStorage.removeItem("basket");
            }
            else{
                
                for( let nb_cmd = 0 ; nb_cmd<basket.length && basket;nb_cmd++ )
                {
                    // Recherche id dans les commandes pour la mise à jour de la nouvelle quantité        
                    if(basket[nb_cmd].id ===  id_article && basket[nb_cmd].color == id_color ) // article present
                    {
                        //suppression cmd            
                        basket.splice(nb_cmd,1);
                        // sauvegarde et mise à jour
                        localStorage.setItem("basket",JSON.stringify(basket));
                        break;
                    }
                }
            }
        }
        
        total_price(UPDATE_TOTAL_PRICE);
        
        //delete du noeud html
        cart__items.removeChild(cart__item);        
    }
    catch(e)
    {
        console.error(e);
    }
    
    dsp_cart_shopping();
}
//------------------------- fonction permettant la mise à jour du nombre d'artice 
// mise à jour  sauvegarde de la commande panier
// mise a jour du prix panier également
function updateNbArticle(e) {
    
    let basket = JSON.parse(localStorage.getItem("basket"));
    try{
        let id_article= e.target.attributes['data-id'].value;
        let color_article= e.target.attributes['data-color'].value;
        let nb_article = e.target.value ;
        //console.log(" nouvelle quantité : "+ nb_article)
        //console.log(" id article : "+ id_article)
        for( let nb_cmd = 0 ; nb_cmd<basket.length;nb_cmd++ )
        {
            //Recherche id dans les commandes pour la mise à jour de la nouvelle quantité            
            if(basket[nb_cmd].id ===  id_article && basket[nb_cmd].color === color_article ) // article present
            {
                if (nb_article>=MIN_QTY &&  nb_article<=MAX_QTY)
                { 
                    basket[nb_cmd].nb = nb_article;
                    // sauvegarde mise à jour
                    localStorage.setItem("basket",JSON.stringify(basket));
                    total_price(UPDATE_TOTAL_PRICE);
                }
                else{
                    
                    e.target.value = basket[nb_cmd].nb;
                }
                break;
            }
        }
    }
    catch(e){
        console.error(e);
    }
}

//--- main appel au chargement / rafraichissement de la page
main();










