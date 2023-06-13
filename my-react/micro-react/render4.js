// 实现React reconciliation 实现调度和diffing算法

// createDom 将fiber转化为Dom
const createDom = (fiber) => {
  // 创建dom元素
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode(''): document.createElement(fiber.type);

  //为dom元素赋予属性
  //  Object.keys(fiber.props)
  //  .filter(key => key !== 'children')
  //  .forEach(prop => dom[prop] = fiber.props[prop]);
  //  return dom;
  updateDom(dom, {}, fiber.props)
  return dom;
}

// Render 函数的意义变了，从 React元素插入到dom中 变成了 初始化第一个nextUnitOfWork
const render = (elem, container) => {
 // 根
 wipRoot = {
   dom: container,
   props: {
     children: [elem]
   },
   alternate: currentRoot
 }
 nextUnitOfWork = wipRoot;
 deletions = [];
}

let nextUnitOfWork = null;
let wipRoot = null;
// 存储最后提交到DOM中的fiber的引用
let currentRoot = null;
// 用于存储删除的Fiber
let deletions = null; 

const workLoop = (deadLine) => {
  // 是否应该终止
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  // 判断是否有足够的时间执行当前任务，若没有，则等系统空闲后执行workhook
  requestIdleCallback(workLoop);

  // commit 阶段
 if(!nextUnitOfWork && wipRoot) {
  commitRoot();
 }
}
// 第一次发起请求
requestIdleCallback(workLoop);

// 下一个工作单元
const performUnitOfWork = (fiber) => {
 // 1：add dom node
 // 2：创建新的fiber
 // 3：返回下一个fiber 
 // 初次渲染时，不存在dom，因此将fiber转化为dom渲染到页面中
 if(!fiber.dom) {
   fiber.dom = createDom(fiber);
 }
 // 给children 新建fiber
 const elements = fiber.props.children;
 // 新建newFiber，构建fiber树
 reconcileChildren(fiber, elements);
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

// 提交
const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

// 递归提交所有fiber
const commitWork = (fiber) => {
  if(!fiber) {
    return;
  }
  const parentDom = fiber.parent && fiber.parent.dom;
  if(fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    parentDom.append(fiber.dom); 
  } else if (fiber.effectTag === 'DELETION' && fiber.dom) {
    parentDom.removeChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom){
    // 更新
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibiling);
}

// 优化newFiber
 const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let presibiling = null; 
  while(index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = element && oldFiber && element.type === oldFiber.type; 
    let newFiber = null;
    //  复用老节点进行更新
    if(sameType) {
      // 更新
      newFiber =  {
        type: oldFiber.type,
        props: elements[index].props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    if(element && !sameType) {
      // 新增
      newFiber =  {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      }
    }
    if(oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber); 
    }
    // 寻找其他子元素
    if(oldFiber) {
      oldFiber = oldFiber.sibiling;
    }
    // 如果是children的第一个，就是唯一儿子，同时将presibiling指向当前newFiber
    if(index === 0) {
      wipFiber.child = newFiber; 
    } else {
      presibiling.sibiling = newFiber;
    }
    presibiling = newFiber;
    index++;
  }
 }

// 更新DOM
const updateDom = (dom, prevProps, nextProps) => {
  const isEvent = (key) => key.startsWith('on');
  // 删除已经没有的或发生变化的事件处理函数
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !key in nextProps || prevProps[key] !== nextProps[key])
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType,prevProps[key]);
    })
  // 添加新的事件处理函数
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => prevProps[key] !== nextProps[key])
    .forEach(key => {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType,prevProps[key]);
    })
  // 删除已经不存在的props
  Object.keys(prevProps)
  .filter(key => key !== 'children')
  .filter(key => !(key in nextProps))
  .forEach(key => {
    dom[key] = ''
  })
  // 赋予新的props或更新旧的props
  Object.keys(nextProps)
  .filter(key => key !== 'children')
  .filter(key => !(key in prevProps)|| prevProps[key] !== nextProps[key])
  .forEach(key => {
    dom[key] = nextProps[key];
  })

  // 更新
}

export default render; 