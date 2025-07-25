document.addEventListener("DOMContentLoaded", function(){
  // burger menu
  const $burgerOpen = document.querySelector('.js-menu-open');
  const $burgerClose = document.querySelector('.js-menu-close');

  if ($burgerOpen) $burgerOpen.addEventListener('click', menuOpen);
  if ($burgerClose) $burgerClose.addEventListener('click', menuClose);

  document.addEventListener('mouseup', function(e) {
    const $menu = document.querySelector('.js-menu-mobile .burger-menu__list');
    const $menuClose = document.querySelector(".js-menu-close");
    const $menuOpen = document.querySelector(".js-menu-open");
 
    if ($menu && !$menu.contains(e.target)) {
      $menu.parentElement.classList.remove('open');
    }
  });

  // scroll header menu
  const $menuItems = document.querySelectorAll('.js-menu-item');

  $menuItems.forEach(item => {
    item.addEventListener('click', (item) => clickMenuHandler(item));
  })

  window.addEventListener('scroll', onScroll);
});

function removeActiveClass() {
  const menuItems = document.querySelectorAll('.js-menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
}

function addActiveClass(id) {
  const menuItem = document.querySelector(`.js-menu-item[href="#${id}"]`);
  
  if (menuItem) {
      menuItem.classList.add('active');
  }
}

function onScroll() {
  const sections = document.querySelectorAll('section');
  let currentSectionId = '';
  
  sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - sectionHeight / 3) {
          currentSectionId = section.getAttribute('id');
      }
  });
  
  if (currentSectionId) {
      removeActiveClass();
      addActiveClass(currentSectionId);
  }
}

function clickMenuHandler(link) {
  const $menuItems = document.querySelectorAll('.js-menu-item');
  $menuItems.forEach(link => {
    link.classList.remove('active')
  });
  link.classList.add('active');
}

function menuOpen() {
  const $menu = document.querySelector('.js-menu-mobile');
  const $menuClose = document.querySelector(".js-menu-close");
  
  $menu.classList.add('open');
}

function menuClose() {
  const $menu = document.querySelector('.js-menu-mobile');
  const $menuOpen = document.querySelector(".js-menu-open");

  $menu.classList.remove('open');
}