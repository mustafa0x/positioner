function getScroll(el) {
    return el === document.body
        ? {x: window.scrollX, y: window.scrollY}
        : {x: el.offsetLeft + el.scrollLeft, y: el.offsetTop + el.scrollTop};
}

/*
 * el -- the element to position
 * rect -- the client rect of the element we attach the popup to
 * pos -- top | bottom | right | left
 * cont -- the container to position within (default: document.body)
 */
export default function positioner(el, rect, pos, cont) {
    cont = cont || document.body
    const contWidth = cont.clientWidth
    const contHeight = cont.clientHeight
    const elwh = {w: el.offsetWidth, h: el.offsetHeight};
    const linkDimensions = {w: rect.right - rect.left, h: rect.bottom - rect.top};
    const halfTopExceed = rect.top + linkDimensions.h/2 - elwh.h/2 < 0;
    const halfLeftExceed = rect.left + linkDimensions.w/2 - elwh.w/2 < 0;
    const halfRightExceed = rect.left + elwh.w/2 + linkDimensions.w/2 >= contWidth;
    const halfBottomExceed = rect.top + elwh.h/2 + linkDimensions.h/2 >= contHeight;
    const topExceed = rect.top - elwh.h < 0;
    const leftExceed = rect.left - elwh.w < 0;
    const bottomExceed = rect.top + elwh.h + linkDimensions.h >= contHeight;
    const rightExceed = rect.left + elwh.w + linkDimensions.w >= contWidth;

    // recompute pos
    // first, when both 'left' and 'right' limits are exceeded, we fall back to top|bottom
    if ((pos === 'left' || pos === 'right') && leftExceed && rightExceed) pos = 'top';
    if (pos === 'top' && topExceed) pos = 'bottom';
    // If it doesn't fit top nor bottom then use bottom -- a scrollbar will be added.
    if (pos === 'bottom' && bottomExceed && !topExceed) pos = 'top';
    if (pos === 'left' && leftExceed) pos = 'right';
    if (pos === 'right' && rightExceed) pos = 'left';

    if (!el.classList.contains(pos))
        el.className = el.className.replace(/\b(top|bottom|left|right)+/, pos);

    const scroll = getScroll(cont);
    const isPopover = el.classList.contains('popover');

    const arrow = el.querySelector('.tip-arrow');
    const arrowWidth = arrow ? arrow.offsetWidth : 0;
    const arrowHeight = arrow ? arrow.offsetHeight : 0;
    let arrowTop;
    let arrowLeft;

    let topPosition;
    let leftPosition;

    if (pos === 'left' || pos === 'right') { // secondary|side positions
        if (pos === 'left') // LEFT
            leftPosition = rect.left + scroll.x - elwh.w - (isPopover ? arrowWidth : 0);
        else // RIGHT
            leftPosition = rect.left + scroll.x + linkDimensions.w;

        // adjust 'top' and arrow
        if (halfTopExceed) {
            topPosition = rect.top + scroll.y;
            if (arrow) arrowTop = linkDimensions.h/2 - arrowWidth;
        } else if (halfBottomExceed) {
            topPosition = rect.top + scroll.y - elwh.h + linkDimensions.h;
            if (arrow) arrowTop = elwh.h - linkDimensions.h/2 - arrowWidth;
        } else {
            topPosition = rect.top + scroll.y - elwh.h/2 + linkDimensions.h/2;
            if (arrow) arrowTop = elwh.h/2 - (isPopover ? arrowHeight*0.9 : arrowHeight/2);
        }
    }
    else if (pos === 'top' || pos === 'bottom') { // primary|vertical positions
        if (pos === 'top') // TOP
            topPosition = rect.top + scroll.y - elwh.h - (isPopover ? arrowHeight : 0);
        else // BOTTOM
            topPosition = rect.top + scroll.y + linkDimensions.h;

        // adjust 'left' | 'right' and also the arrow
        if (halfLeftExceed) {
            leftPosition = 0;
            if (arrow) arrowLeft = rect.left + linkDimensions.w/2 - arrowWidth;
        } else if (halfRightExceed) {
            leftPosition = contWidth - elwh.w*1.01;
            if (arrow) arrowLeft = elwh.w - (contWidth - rect.left) + linkDimensions.w/2 - arrowWidth/2;
        } else {
            leftPosition = rect.left + scroll.x - elwh.w/2 + linkDimensions.w/2;
            if (arrow) arrowLeft = elwh.w/2 - arrowWidth/2;
        }
    }

    el.style.top = topPosition + 'px';
    el.style.left = leftPosition + 'px';

    if (arrowTop)
        arrow.style.top = arrowTop + 'px';
    if (arrowLeft)
        arrow.style.left = arrowLeft + 'px';
}
