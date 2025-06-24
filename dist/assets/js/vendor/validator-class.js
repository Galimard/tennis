class ValidadorForm {
  constructor(selector, options) {
    this.$form = document.querySelector(selector);
    this.errorPosition = options.errorPosition;
    this.setupDisabledSubmitBtn = options.setupDisabledSubmitBtn || false;
    this.isCheckboxChangedFields = options.isCheckboxChangedFields || false;
    this.isPasswordErrorRegs = options.isPasswordErrorRegs || false;
    this.isPasswordErrorSeparate = options.isPasswordErrorSeparate || false;
    this.passError = options.passError;
    this.passRegAllSymbols = options.passRegAllSymbols;
    this.passRegNumbers = options.passRegNumbers;
    this.passRegLang = options.passRegLang;
    this.passRegLangSm = options.passRegLangSm;
    this.passRegSymbol = options.passRegSymbol;
    this.passErrorNumbers = options.passErrorNumbers;
    this.passErrorLang = options.passErrorLang;
    this.passErrorLangSm = options.passErrorLangSm;
    this.passErrorSymbols = options.passErrorSymbols;
    this.passErrorMaxLength = options.passErrorMaxLength;
    this.count = options.countRequiredField;
    this.isErrorCommon = options.isErrorCommon || false;
    this.changedFields = [];
    this.checkboxes = [];
    this.statusErrorCommon = false;

    this.setup();
  }

  setup = () => {
    if (this.$form) {
      this.radios = this.$form.querySelectorAll('[type="radio"]');

      if (this.isErrorCommon) {
        this.checkboxInit();
      }
      if (this.setupDisabledSubmitBtn) {
        this.$form.classList.add('disabled');
        this.enableSubmitBtn();
        const fields = this.$form.querySelectorAll('input');
        const textarea = this.$form.querySelectorAll('textarea');
        const selects = this.$form.querySelectorAll('select');
        
        textarea.forEach(textarea => { 
          textarea.addEventListener('input', this.enableSubmitBtn);   
        });
        selects.forEach(select => { 
          select.addEventListener('change', this.enableSubmitBtn);   
        });

        // если при чекбоксе меняется количество обязательных полей
        if (this.isCheckboxChangedFields) {
          this.checkboxInit();

          fields.forEach(input => { 
            if (input.type !== 'radio' && input.type !== 'checkbox') input.addEventListener('input', this.enableSubmitBtn);   
          });
        } else {
          fields.forEach(input => { 
            if (input.type !== 'radio') input.addEventListener('input', this.enableSubmitBtn);   
          });
        }
      } 
    } 
  }

  checkFields = () => {
    let result = {
      valid  : true,  
      fields : []     
    };
    const fieldsToCheck = this.filterFormElements(this.$form.elements);

    // обязательные
    fieldsToCheck.isRequired.forEach((elm, i) => {
      const fieldData = this.checkField(elm);
      result.valid = !!(result.valid * fieldData);

      result.fields.push({
          field: elm,
          valid: fieldData
      });
    });

    // не обязательные
    fieldsToCheck.isNotRequired.forEach((elm, i) => {
      if (elm.value.length > 0) {
        const fieldData = this.checkField(elm, false);
        result.valid = !!(result.valid * fieldData);
  
        result.fields.push({
            field: elm,
            valid: fieldData
        });
      } 
      // else {
      //   this.removeError(elm);
      // }    
    });

    return result;
  }

  filterFormElements = (fields) => {
    let i,
      fieldsToCheck = {
        isRequired: [],
        isNotRequired: []
      };

    for (i = fields.length; i--;) {
      var isAllowedElement = fields[i].nodeName.match(/input|textarea|select/gi),
          isRequiredAttirb = fields[i].hasAttribute('required'),
          isDisabled = fields[i].hasAttribute('disabled'),
          isHidden = fields[i].type === 'hidden';

      if (isAllowedElement && !isDisabled && !isHidden) {
        if (isRequiredAttirb) {
          fieldsToCheck.isRequired.push(fields[i]);
        } else {
          fieldsToCheck.isNotRequired.push(fields[i]);
        }                        
      }                  
    }

    return fieldsToCheck;
  }

  checkField = (field, isRequired = true) => {
    let result = false;

    switch(field.type) {
      case 'text':  
      case 'textarea':  
        result = this.checkText(field);
        break;    
      case 'email':  
        result = this.checkEmail(field, isRequired);
        break;  
      case 'tel':  
        result = this.checkPhone(field, isRequired);
        break;  
      case 'select-one':  
        result = this.checkSelect(field);
        break;
      case 'checkbox':  
        result = this.checkCheckbox(field);
        break;
      case 'radio':  
        result = this.checkRadio(field, isRequired);
        break; 
      case 'number':  
        result = this.checkNumber(field, isRequired);
        break; 
      case 'file':  
        result = this.checkFile(field);
        break;  
      default:
        result = this.checkText(field);
    }

    if (field.classList.contains('js-password')) result = this.checkPassword(field);

    return result;
  }

  checkText = (field) => {
    let result = false;

    const {
      error,
      minLength,
      minLengthError,
      maxLength,
      maxLengthError,
      emptyError,
      regex,
      regexError,
    } = field.dataset;

    if (field.value.length > 0) {
      if (minLength || maxLength) {
        if (field.value.length < Number(minLength)) {
          this.addError(field, minLengthError);
          result = false;          
          return result;
        } else if (field.value.length > Number(maxLength)) {
          this.addError(field, maxLengthError);  
          result = false;    
          return result;
        } else {
          if (regex) {
            // const newReg = regex.split('/');
            // if (field.value.search(new RegExp(newReg[0], newReg[1])) === -1) {
  
            if (!new RegExp(regex).test(field.value)) {  
              this.addError(field, regexError);
              result = false;   
              return result;         
            } else {
              this.removeError(field);
              result = true;
              return result;
            }
          } else {
            this.removeError(field);
            result = true;
          }  
        }
      } else {
        this.removeError(field);
        result = true;
      }

      if (regex) {
        if (!new RegExp(regex).test(field.value)) {  
          this.addError(field, regexError);
          result = false;   
          return result;         
        } else {
          this.removeError(field);
          result = true;
          return result;
        }
      } else {
        this.removeError(field);
        result = true;
        return result;
      }  
    } else {       
      emptyError ? this.addError(field, emptyError) : this.addError(field, error);  
      result = false;             
    } 

    return result;
  }

  checkNumber = (field) => {
    let result = false;

    const {
      error,
      minLength,
      minLengthError,
      maxLength,
      maxLengthError,
      emptyError
    } = field.dataset;

    if (field.value.length > 0) {
      if (minLength || maxLength) {
        if (field.value.length < Number(minLength)) {
          this.addError(field, minLengthError);
          result = false;
          return result;
        } else if (field.value.length > Number(maxLength)) {
          this.addError(field, maxLengthError);  
          result = false;   
          return result;
        } else {
          this.removeError(field);
          result = true;
          return result;
        }
      } else {
        this.removeError(field);
        result = true;
      }
    } else {
      emptyError ? this.addError(field, emptyError) : this.addError(field, error);  
      result = false;
    }

    return result;
  }

  checkEmail = (field, isRequired = true) => {
    const {error, emptyError} = field.dataset;
    let result = false;

    if (field.value.length > 0) {
  
      if (this.isEmailValid(field.value)) {
        this.removeError(field);
        result = true;
      } else {
        this.addError(field, error);
        result = false;
      }
          
    } else {
      emptyError ? this.addError(field, emptyError) : this.addError(field, error);   
      result = false;
    } 
  
    return result;
  }

  isEmailValid = (value) => {
    var reg = /[а-яА-ЯёЁ]/g;
    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
  
    if (value.search(reg) === -1) {
      return EMAIL_REGEXP.test(value);
    }
  }

  checkPhone = (field, isRequired = true) => {
    const {error, emptyError} = field.dataset;
    let result = false;

    if (field.value.length > 0) {

      if (isRequired) {
        if (!/_/.test(field.value)) {
          this.removeError(field);
          result = true;
        } else {
          this.addError(field, error);
          result = false;
        }  
      } else {
        const found = field.value.match(/_/g);

        if (found && (found.length >= 1 && found.length <= 9)) { 
          this.addError(field, error);
          result = false;
        } else {
          this.removeError(field);
          result = true;
        } 
      }
    } else {
      emptyError ? this.addError(field, emptyError) : this.addError(field, error);      
      result = false;
    }
  
    return result;
  }

  checkPassword(field) {
    const {error, passCheck, minLength, maxLength, id} = field.dataset;
    let result = false;

    if (passCheck === 'true') { // Пароль с подтверждением
      // Первый ввод пароля
      if (id === 'password-1') {
        if (field.value.length > 0) {
      
          // кол-во символов
          if (field.value.length <= minLength) {
            this.addError(field, error);
            result = false;
          } 
          if (field.value.length >= maxLength) { 
            this.addError(field, this.passErrorMaxLength);  
            result = false;    
          } 
          if (field.value.length >= minLength && field.value.length <= maxLength) {
            if (this.isPasswordErrorRegs) { // регулярки              
              if (this.isPasswordErrorSeparate) { // ошибки раздельно
                if (field.value.search(this.passRegLangSm) === -1 && field.value.search(this.passRegLang) === -1) { //латинница
                  this.addError(field, 'Пароль должен содержать латинские символы верхнего (A-Z) и нижнего регистра (a-z)');
                  result = false; 
                } else if (field.value.search(this.passRegLangSm) === -1) { //a-z
                  this.addError(field, this.passErrorLangSm);
                  result = false; 
                } else if (field.value.search(this.passRegLang) === -1) { //A-Z
                  this.addError(field, this.passErrorLang);
                  result = false;
                } else if (field.value.search(this.passRegSymbol) === -1) { //symbols
                  this.addError(field, this.passErrorSymbols);
                  result = false;
                } else if (field.value.search(this.passRegNumbers) === -1) { //numbers
                  this.addError(field, this.passErrorNumbers);
                  result = false;
                } else {
                  this.removeError(field);
                  result = true; 
                }
              } else { // ошибки в один текст
                let resultError = '';
        
                if (field.value.search(this.passRegNumbers) === -1 || field.value.search(this.passRegLangSm) === -1 || field.value.search(this.passRegLang) === -1 || field.value.search(this.passRegSymbol) === -1) {
                  if (field.value.search(this.passRegNumbers) === -1) {
                    resultError += this.passErrorNumbers;
                  } 
                  if (field.value.search(this.passRegLangSm) === -1) {
                    resultError += this.passErrorLangSm;
                  }
                  if (field.value.search(this.passRegLang) === -1) {
                    resultError += this.passErrorLang;
                  }
                  if (field.value.search(this.passRegSymbol) === -1) {
                    resultError += this.passErrorSymbols;
                  } 
                  this.addError(field, resultError);
                  result = false;
                } else {
                  this.removeError(field);
                  result = true; 
                }
              }              
            } else {
              this.removeError(field);
              result = true; 
            }
          }
        }  
      }
     
      // Подтверждение пароля
      if (id === 'password-2') { 
        const pass1 = this.$form.querySelector('[data-id="password-1"]');

        if (pass1) {
          if (field.value.length > 0) {
            if (field.value === pass1.value) {
              this.removeError(field);
              result = true;
            } else {
              this.addError(field, this.passError);
              result = false;
            }
          } else {
            this.addError(field, error);
            result = false;
          }
        }         
      }

    } else { // Одиночный пароль
      if (field.value.length > 0) {

        // кол-во символов
        if (field.value.length < minLength) {
          this.addError(field, error);
          result = false;
        }  
        if (field.value.length > maxLength) { 
          this.addError(field, this.passErrorMaxLength);  
          result = false;    
        }
        if (field.value.length > minLength && field.value.length < maxLength) {
          if (this.isPasswordErrorRegs) { // регулярки
            if (this.isPasswordErrorSeparate) { // ошибки раздельно
              if (field.value.search(this.passRegLangSm) === -1 && field.value.search(this.passRegLang) === -1) { //латинница
                this.addError(field, 'Пароль должен содержать латинские символы верхнего (A-Z) и нижнего регистра (a-z)');
                result = false; 
              } else if (field.value.search(this.passRegLangSm) === -1) { //a-z
                this.addError(field, this.passErrorLangSm);
                result = false; 
              } else if (field.value.search(this.passRegLang) === -1) { //A-Z
                this.addError(field, this.passErrorLang);
                result = false;
              } else if (field.value.search(this.passRegSymbol) === -1) { //symbols
                this.addError(field, this.passErrorSymbols);
                result = false;
              } else if (field.value.search(this.passRegNumbers) === -1) { //numbers
                this.addError(field, this.passErrorNumbers);
                result = false;
              } else {
                this.removeError(field);
                result = true; 
              }
            } else { // ошибки в один текст
              let resultError = '';
      
              if (field.value.search(this.passRegNumbers) === -1 || field.value.search(this.passRegLangSm) === -1 || field.value.search(this.passRegLang) === -1 || field.value.search(this.passRegSymbol) === -1) {
                if (field.value.search(this.passRegNumbers) === -1) {
                  resultError += this.passErrorNumbers;
                } 
                if (field.value.search(this.passRegLangSm) === -1) {
                  resultError += this.passErrorLangSm;
                }
                if (field.value.search(this.passRegLang) === -1) {
                  resultError += this.passErrorLang;
                }
                if (field.value.search(this.passRegSymbol) === -1) {
                  resultError += this.passErrorSymbols;
                } 
                this.addError(field, resultError);
                result = false;
              } else {
                this.removeError(field);
                result = true; 
              }
            }              
          } else {
            this.removeError(field);
            result = true; 
          }
        }
      } 
    }

    return result;
  }

  checkSelect = (field) => {
    let result = false;
    const { error } = field.dataset;
    const $selectWrap = field.closest('.select-ui');

    if (field.value.length === 0) {
      this.addError(field, error);
      $selectWrap.classList.add('error');
      result = false;             
    } else {
      this.removeError(field);
      $selectWrap.classList.remove('error');
      result = true;     
    } 
  
    return result;
  }

  checkCheckbox = (field) => {
    let result = false;
    const { error } = field.dataset;

    if (field.required) {
      if (this.isErrorCommon) {
        if (this.statusErrorCommon) {
          this.removeErrorCommon(field);
          result = true;
        } else {
          this.addErrorCommon(field, error);
          result = false; 
        }
      } else {
        if (field.checked) {
          this.removeError(field);
          result = true; 
        } else {
          this.addError(field, error);
          result = false;  
        }
      }  
    }
    
    return result;
  }

  checkboxInit = () => {
    const $inputCheckboxes = this.$form.querySelectorAll('[type="checkbox"]');
    
    $inputCheckboxes.forEach(checkbox => {
      if (checkbox.checked) this.checkboxHandler(checkbox);
      checkbox.addEventListener('change', () => this.checkboxHandler(checkbox));
    });
  }

  checkboxHandler = (input) => {    
    const id = input.id; 

    if (input.checked) {
      this.checkboxes.push(input);
    } else {
      this.checkboxes = this.checkboxes.filter(input => input.id !== id);
    }
 
    if (this.checkboxes.length === 2) {
      this.statusErrorCommon = true;
    } else {
      this.statusErrorCommon = false;
    }
    // const count = this.count;

    // if (input.checked) {
    //   this.checkboxes.push(input);
    //   if (this.checkboxes.length === 0) {
    //     this.count = count;
    //   }
    //   if (this.checkboxes.length === 1) {
    //     this.count = count+1;
    //   }
    //   if (this.checkboxes.length === 2) {
    //     this.count = count+2;
    //   }
    // } else {
    //   this.checkboxes = this.checkboxes.filter(input => input.id !== id);
    //   this.changedFields = this.changedFields.filter(field => field.id !== $select.id);

    //   if (this.checkboxes.length === 0) {
    //     this.count = count;
    //   }
    //   if (this.checkboxes.length === 1) {
    //     this.count = count+1;
    //   }
    //   if (this.checkboxes.length === 2) {
    //     this.count = count+2;
    //   }
    // }
   
    // this.enableSubmitBtn();
  }

  checkRadio = (field) => {
    let result = false;
    let checked = [];
    const { error } = field.dataset;

    if (field.required) {
      this.radios.forEach(radio => {
        radio.classList.remove('checked');
        
        if (radio.checked) {
          radio.classList.add('checked');
          checked.push(radio);
        }  
      });
      if (checked.length > 0) {
        this.removeError(field);
        result = true; 
      } else {
        this.addError(field, error);
        result = false;  
      }
    }

    return result;
  }

  checkFile = (field) => {
    let result = false;
    const { error } = field.dataset;

    if (field.required) {
      if (this.isErrorCommon) {
        const $fields = this.$form.querySelectorAll(`[type="${field.type}"][data-common="true"]`);
        this.checkCommonFields($fields, field.type);

        if (this.statusErrorCommon) {
          this.removeErrorCommon(field);
          result = true;
        } else {
          this.addErrorCommon(field, error);
          result = false; 
        }
      } else {        
        if (field.files.length > 0) {
          this.removeError(field);
          result = true; 
        } else {
          this.addError(field, error);
          result = false;  
        }
      }  
    }
    
    return result;
  }

  checkCommonFields = ($fields, type) => {    
    let countFields = [];

    switch(type) {
      case 'file':           
        $fields.forEach(input => {  
          const id = input.id;

          if (input.files.length > 0 || input.classList.contains("changed")) {
            countFields.push(input);
          } else {
            countFields = countFields.filter(input => input.id !== id);
          }  
        });

        if (countFields.length === $fields.length) {
            this.statusErrorCommon = true;
          } else {
            this.statusErrorCommon = false;
          }
        break;  
      default:
        console.log(type);
    }
  }

  addError = ($input, error) => {
    this.removeError($input);
    const $parent = $input.closest('.field');  
    const $alert = document.createElement('div');

    if (this.errorPosition === 'absolute') {
      $alert.classList.add('alert-absolute');
    } else {
      $alert.classList.add('alert');
    }
    
    $alert.innerText = error;
    $parent.after($alert);
  
    $input.classList.add('error');  
  }

  addErrorCommon = ($input, error) => {
    const $parent = $input.closest('.form');  
    const $alert = $parent.querySelector('.js-alert'); 
    if ($alert) $alert.innerText = error; 
    $input.classList.add('error');  
  }
  
  removeError = ($input) => {
    const $parent = $input.closest('.field');
    const $error = $parent.nextSibling;
    if ($error) $error.remove();
  
    $input.classList.remove('error');  
  }  

  removeErrorCommon = ($input) => {
    const $parent = $input.closest('.form');
    const $error = $parent.querySelector('.js-alert'); 
    if ($error) $error.innerHTML = '';
  
    $input.classList.remove('error');  
  } 

  enableSubmitBtn = () => {
    const $fieldsChanged = this.$form.querySelectorAll('.changed');
    let array = [];

    $fieldsChanged.forEach(el => {      
      if (el.required) {
        array.push(el);
        this.changedFields = array.filter((field, index, arr) => {
          if (arr.lastIndexOf(field) == index) return field;
        });        
      }
    });

    if (this.changedFields.length >= this.count) {
      this.$form.classList.remove('disabled');
    } else {
      this.$form.classList.add('disabled');
    }
  }

  clearForm = (e) => {
    this.$form.reset();

    [...this.$form.elements].forEach(el => {
      el.classList.remove('changed');
    });
  }

  showSuccessMessage = () => {
    let formContent, formMessage, formWrapContent;

    formWrapContent = this.$form.closest('.form-wrap-content');
    formContent = this.$form.closest('.form-content');
    formMessage = formWrapContent.querySelector('.form-message');
    // formWrapContent.classList.add('message'); //для сброса формы
  
    if (formContent) formContent.classList.add('hide');
    if (formMessage) formMessage.classList.add('active'); 
  }

  showErrorMessage = () => {
    let formContent, formMessageError, formWrapContent;
  
    formWrapContent = this.$form.closest('.form-wrap-content');
    formContent = this.$form.closest('.form-content');
    formMessageError = formWrapContent.querySelector('.form-message-error');
    // formWrapContent.classList.add('error-message'); //для закрытия формы с ошибкой 
  
    if (formContent) formContent.classList.add('hide');
    if (formMessageError) formMessageError.classList.add('active');
  }

  showSuccessMessageModal = () => {
    let formContent, formMessage, modalFormWrap;
  
    modalFormWrap = this.$form.closest('.modal-custom__body'); 
    formContent = modalFormWrap.querySelector('.form-content');
    formMessage = modalFormWrap.querySelector('.form-message');
    modalFormWrap.classList.add('message'); //для сброса формы
  
    if (formContent) formContent.classList.add('hide');
    if (formMessage) formMessage.classList.add('active'); 
  }

  showErrorMessageModal = () => {
    let formContent, formMessageError, modalFormWrap;
  
    modalFormWrap = this.$form.closest('.modal-custom__body');
    formContent = modalFormWrap.querySelector('.form-content');
    formMessageError = modalFormWrap.querySelector('.form-message-error');
    modalFormWrap.classList.add('error-message'); //для закрытия формы с ошибкой 
  
    if (formContent) formContent.classList.add('hide');
    if (formMessageError) formMessageError.classList.add('active');
  }
}