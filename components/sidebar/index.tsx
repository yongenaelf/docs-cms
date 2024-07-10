"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { NodesData, NodesItem } from "../../services/larkServices";
import { useEffect, useState } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import "./index.css";
import { findPathByKey, findTopLevelItems } from "../../lib/utils";

interface Props {
  menu: NodesData;
}

const MenuItem = ({ item }: { item: NodesItem }) => {
  return (
    <li>
      {item.title}
      {item.has_child && item.children?.length > 0 && (
        <ul>
          {item.children.map(ele => {
            return ele.items.map(element => {
              return <MenuItem item={element} />;
            });
          })}
        </ul>
      )}
    </li>
  );
};

type MenuItem = Required<MenuProps>["items"][number];
export default function Sidebar({ menu }: Props) {
  const params = useParams();
  const { id } = params;
  let temp: any = {};
  temp.items = findTopLevelItems(menu, id as string);
  const [openKeys, setOpenKeys] = useState([] as string[]);
  // click icon to open or close submenu
  const onIconClick = ({ key }: { key: string }) => {
    if (openKeys.includes(key)) {
      setOpenKeys(openKeys.filter(openKey => openKey !== key));
    } else {
      setOpenKeys([...openKeys, key]);
    }
  };
  // not use the original open/close
  const renderTitle = (title: string, key: string, hasChild: boolean) => (
    <div className="flex items-center justify-between">
      <Link href={`/${key}`} className="w-[90%]">
        <span>{title}</span>
      </Link>
      {hasChild &&
        (openKeys.includes(key) ? (
          <DownOutlined
            onClick={e => {
              e.stopPropagation();
              onIconClick({ key });
            }}
          />
        ) : (
          <RightOutlined
            onClick={e => {
              e.stopPropagation();
              onIconClick({ key });
            }}
          />
        ))}
    </div>
  );

  // convert to menu items format
  const getMenuList = (data: NodesData) => {
    const items = data.items;
    const arr = [];
    for (let i = 0; i < items?.length; i++) {
      let obj: any = {
        key: items[i].obj_token,
        label: renderTitle(
          items[i].title,
          items[i].obj_token,
          items[i].has_child
        ),
      };
      if (!items[i].children.length) {
        obj.children = null;
      }
      for (let j = 0; j < items[i].children.length; j++) {
        obj.children = getMenuList(items[i].children[j]);
      }
      arr.push(obj);
    }
    return arr;
  };
  const menuItems: MenuItem[] = getMenuList(temp);

  useEffect(() => {
    const defaultOpenKeys = findPathByKey(temp, id as string)?.map(
      ele => ele.obj_token
    );
    setOpenKeys(defaultOpenKeys!);
  }, [id]);

  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
      <Menu
        openKeys={openKeys}
        defaultOpenKeys={openKeys}
        inlineCollapsed={false}
        style={{ width: 256 }}
        defaultSelectedKeys={id}
        mode="inline"
        items={menuItems}
        expandIcon={null}
      />
    </aside>
  );
}
