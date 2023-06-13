// 实现React 将Render和Commit阶段分离
// 1. 删除在performUnitOfWork中修改dom的部分。

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
 wipRoot = {
   dom: container,
   props: {
     children: [elem]
   },
   sibiling: null,
   child: null,
   parent: null
 }
 nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;

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

// 提交
const commitRoot = () => {
  // 入口是child，、需要将其插入父节点的dom中
  commitWork(wipRoot.child);
  wipRoot = null;
}

// 递归提交所有fiber
const commitWork = (fiber) => {
  if(!fiber) {
    return;
  }
  const parentDom = fiber.parent.dom;
  parentDom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

export default render; 