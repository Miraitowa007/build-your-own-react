// 渲染任务调度逻辑--Fiber升级

// 传入两个参数，第一个是react元素，第二个是dom元素
const render = (elem, container) => {
  // 创建dom元素
  const dom = elem.type === 'TEXT_ELEMENT' ? document.createTextNode(''): document.createElement(elem.type);

  //为dom元素赋予属性
  Object.keys(elem.props)
  .filter(key => key !== 'children')
  .forEach(prop => dom[prop] = elem.props[prop]);

  // 删除递归，递归严重影响性能，且无脑无优先级更新

  // 将dom元素追加到父节点中
  container.append(dom);
}

let nextUnitOfWork = null;
const workLoop = (deadLine) => {
  // 是否应该终止
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRmatining() < 1;
  }
  // 判断是否有足够的时间执行当前任务，若没有，则等系统空闲后执行workhook
  requestIdleCallback(workLoop);
}
// 第一次发起请求
requestIdleCallback(workLoop);

const performUnitOfWork = () => {

}

export default render; 