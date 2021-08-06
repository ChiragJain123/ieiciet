function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0
    );
  }
window.addEventListener('scroll', (e) => {
    const section = document.getElementsByClassName('animate');
    for(let ele of section){
        if(isInViewport(ele)){
            ele.classList.remove('hidden');
            ele.classList.add('visible');
        }else{
            ele.classList.add('hidden');
            ele.classList.remove('visible');
            ele.classList.remove('animation-delay');
        }
    }
})