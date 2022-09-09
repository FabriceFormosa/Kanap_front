// message de validation et d'affichage de la commande finale
function confirmCommande()
{
    let str = window.location.href;
    let url = new URL(str);
    //console.log("url script confirmation :"+url);
    let numCmd = url.searchParams.get("commande");
    //console.log(numCmd);
    localStorage.removeItem("basket");
    document.querySelector("#orderId").innerHTML = `<br>${numCmd}<br>Merci pour votre achat`;
}
// point d'entrée au chargement de la page
confirmCommande();



