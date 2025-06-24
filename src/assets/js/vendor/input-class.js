class Input {
  constructor(selector) {
      this.$elements = document.querySelectorAll(selector);

      this.setup();
  }

  setup = () => {
    this.checkChangedInputs();
    this.passwordInit();
    this.checkboxInit();
    this.$elements.forEach(input => {    
        input.addEventListener('input', this.onChangeHandler);    
        input.addEventListener('focusout', this.onFocusHandler);
    });
  }

  checkChangedInputs = () => {
    this.$elements.forEach(input => {  
      if (input.type === 'checkbox') {
        input.checked ? input.classList.add('changed') : input.classList.remove('changed');
      } else {
        input.value === '' ? input.classList.remove('changed') : input.classList.add('changed');
      }
    });
  }

  onChangeHandler = (event) => {
    const $this = event.currentTarget;  
  
    if ($this.type === 'checkbox') {
      $this.checked ? $this.classList.add('changed') : $this.classList.remove('changed');
    } else {
      $this.value === '' ? $this.classList.remove('changed') : $this.classList.add('changed');
    } 
  }

  onFocusHandler = (event) => {
    const trimValue = event.target.value.trim();
    event.target.value = trimValue;
  }

  passwordInit = () => {
    const $inputPassword = document.querySelectorAll('[type="password"]');
    if ($inputPassword) {
      $inputPassword.forEach(password => {
        const $parent = password.closest('.form-item'); 
        const $eyeBtn = $parent.querySelector('.js-eye');
        const $eyeHideBtn = $parent.querySelector('.js-eye-hide');
    
        if ($eyeBtn && $eyeHideBtn) {
          password.addEventListener('focus', () => this.passwordFocusHandler($eyeBtn, $eyeHideBtn));
          password.addEventListener('focusout', () => this.passwordFocusOutHandler($eyeBtn, $eyeHideBtn, password));
          $eyeHideBtn.addEventListener('click', () => this.showPassword($eyeBtn, $eyeHideBtn, password));
          $eyeBtn.addEventListener('click', () => this.hidePassword($eyeBtn, $eyeHideBtn, password));
        }     
      });       
    }    
  }

  showPassword = ($eyeBtn, $eyeHideBtn, $inputPassword) => {
    const type = $inputPassword.getAttribute("type") === "password" ? "text" : "password";
    $inputPassword.setAttribute("type", type);
    $eyeBtn.classList.remove('hide');
    $eyeHideBtn.classList.add('hide');
  }

  hidePassword = ($eyeBtn, $eyeHideBtn, $inputPassword) => {
    const type = $inputPassword.getAttribute("type") === "password" ? "text" : "password";
    $inputPassword.setAttribute("type", type);
    $eyeBtn.classList.add('hide');
    $eyeHideBtn.classList.remove('hide');
  }

  passwordFocusHandler = ($eyeBtn, $eyeHideBtn) => {
    const svgEye = $eyeBtn.querySelector('svg');
    const svgEyeHide = $eyeHideBtn.querySelector('svg');
    
    svgEye.style.color = '#14143E';
    svgEyeHide.style.color = '#14143E';
  }

  passwordFocusOutHandler = ($eyeBtn, $eyeHideBtn, $inputPassword) => {
    const svgEye = $eyeBtn.querySelector('svg');
    const svgEyeHide = $eyeHideBtn.querySelector('svg');

    if ($inputPassword.classList.contains('changed')) {
      svgEye.style.color = '#14143E';
      svgEyeHide.style.color = '#14143E';
    } else {
      svgEye.style.color = '#7C8285';
      svgEyeHide.style.color = '#7C8285';
    }    
  }

  checkboxInit = () => {
    // перенести checkboxHandler в валидацию
    const $inputCheckboxes = document.querySelectorAll('[type="checkbox"]');
    
    $inputCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.checkboxHandler(checkbox));
    });
  }

  checkboxHandler = (input) => {
    console.log(123);
  }
}