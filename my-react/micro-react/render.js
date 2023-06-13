// 传入两个参数，第一个是react元素，第二个是dom元素
const render = (elem, container) => {
  // 创建dom元素
  const dom =
    elem.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(elem.type);

  //为dom元素赋予属性
  Object.keys(elem.props)
    .filter((key) => key !== "children")
    .forEach((prop) => (dom[prop] = elem.props[prop]));

  // 递归渲染子元素，递归停止：子元素没有子元素了
  elem.props.children.forEach((item) => render(item, dom));

  // 将dom元素追加到父节点中
  container.append(dom);
};

export default render;
