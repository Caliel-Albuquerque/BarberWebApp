//MENU-SIDEBAR 

var buttonMenu = document.getElementById("contentMenu");  
var sideBar = document.getElementById("contentSidebar");

var closeSidebar = document.getElementById("container");


buttonMenu.addEventListener("click", () => {
    sideBar.classList.toggle("ativar_menu")
    
})

closeSidebar.addEventListener("click", () =>{
    sideBar.classList.remove("ativar_menu")
})

