//MENU-SIDEBAR 

var buttonMenu = document.getElementById("contentMenu");  
var sideBar = document.getElementById("contentSidebar");
var iconMenu = document.getElementById("icon_menu");


var closeSidebar = document.getElementById("container");
var closeSidebarServico = document.getElementById("containerServico");

buttonMenu.addEventListener("click", () => {
    sideBar.classList.toggle("ativar_menu")

    

    
})

closeSidebar.addEventListener("click", () =>{
    sideBar.classList.remove("ativar_menu")
})

closeSidebarServico.addEventListener("click", () =>{
    sideBar.classList.remove("ativar_menu")
})

