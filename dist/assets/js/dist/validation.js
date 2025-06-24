document.addEventListener("DOMContentLoaded", function(){
  const form = document.querySelector('#form');
  const formErrorBtn = document.querySelector('.js-clear-form');

  if (form) {
    const validator = new ValidadorForm('#' + form.id, {
      errorPosition: 'absolute', 
      setupDisabledSubmitBtn: false, 
    });

    form.onsubmit = function(e) {
      e.preventDefault();
      const validatorResult = validator.checkFields();
      console.log('validatorResult', validatorResult);
      
      if (validatorResult.valid) {
        //еще проверка ответа сервера
        // validator.showSuccessMessage(); //если успешный ответ
        validator.showErrorMessage(); //если ошибка с сервера
      } 
    }   
  }

  if (formErrorBtn) {
    formErrorBtn.addEventListener('click', (e) => {
      console.log(e.target);
      
      let formContent, formMessageError, formWrapContent;
  
      formWrapContent = e.target.closest('.form-wrap-content');
      formContent = formWrapContent.querySelector('.form-content');
      formMessageError = formWrapContent.querySelector('.form-message-error');
    
      if (formContent) formContent.classList.remove('hide');
      if (formMessageError) formMessageError.classList.remove('active');
    });
  }
});