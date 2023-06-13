// 实现React Fiber架构 - Fiber树

// createDom 将fiber转化为Dom
const createDom = (fiber) => {
   // 创建dom元素
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode(''): document.createElement(fiber.type);

  //为dom元素赋予属性
  Object.keys(fiber.props)
  .filter(key => key !== 'children')
  .forEach(prop => dom[prop] = fiber.props[prop]);
  return dom;
}

// Render 函数的意义变了，从 React元素插入到dom中 变成了 初始化第一个nextUnitOfWork
const render = (elem, container) => {
  // 根
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [elem]
    },
    sibiling: null,
    child: null,
    parent: null
  }
}

let nextUnitOfWork = null;
const workLoop = (deadLine) => {
  // 是否应该终止
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  // 判断是否有足够的时间执行当前任务，若没有，则等系统空闲后执行workhook
  requestIdleCallback(workLoop);
}
// 第一次发起请求
requestIdleCallback(workLoop);

const performUnitOfWork = (fiber) => {
  // 1：add dom node
  // 2：创建新的fiber
  // 3：返回下一个fiber 
  // 初次渲染时，不存在dom，因此将fiber转化为dom渲染到页面中
  console.log('fiber', fiber);
  if(!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // 追加到父节点
  if(fiber.parent) {
    fiber.parent.dom.append(fiber.dom);
  }
  // 给children 新建fiber
  const elements = fiber.props.children;
  // preSibling用于记录非亲儿子情况下的前一个兄弟组件
  let preSibling = null;
  for(let i = 0; i < elements.length; i++) {
    const newFiber = {
      type: elements[i].type,
      props: elements[i].props,
      parent: fiber,
      dom: null,
      child: null,
      sibiling: null 
    }
    //为fiber之间构建关系，构建Fiber tree
    // 如果是children的第一个，就是唯一儿子，同时将preSibling指向当前newFiber
    if(i === 0) {
      fiber.child = newFiber; 
    } else {
      preSibling.sibiling = newFiber;
    }
    preSibling = newFiber;
  }
  // 返回下一个fiber
  if(fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
   while(nextFiber) {
    if(nextFiber.sibiling) {
      return nextFiber.sibiling;
    }
    nextFiber = nextFiber.parent;
   }

}

export default render; 