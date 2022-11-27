//MENU-SIDEBAR 

var buttonMenu = document.getElementById("contentMenu");  
var sideBar = document.getElementById("contentSidebar");


buttonMenu.addEventListener("click", () => {
    sideBar.classList.toggle("ativar_menu")
    
})