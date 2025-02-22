import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TranslateDto } from './dto/translate.dto';

import axios from 'axios';

interface InterfaceMap {
  [key: string]: string;
}

function jsonToTs(obj: any, rootName: string = 'IResponse'): string {
  const interfaces: InterfaceMap = {};

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateInterfaceName = (parentName: string, key: string): string => {
    return `I${capitalize(parentName)}${capitalize(key)}`;
  };

  const getTypeString = (
    value: any,
    parentName: string,
    key: string,
  ): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';
      const types = new Set(
        value.map((item) => getTypeString(item, parentName, key)),
      );
      const itemType = Array.from(types).join(' | ');
      return `${itemType}[]`;
    }
    if (typeof value === 'object') {
      const interfaceName = generateInterfaceName(parentName, key);
      const interfaceContent = generateInterface(value, interfaceName);

      // 检查是否已存在相同的接口内容
      let existingName: string | null = null;
      for (const [name, content] of Object.entries(interfaces)) {
        if (content === interfaceContent && name !== interfaceName) {
          existingName = name;
          break;
        }
      }

      if (existingName) {
        return existingName;
      }

      interfaces[interfaceName] = interfaceContent;
      return interfaceName;
    }
    return typeof value;
  };

  const generateInterface = (obj: any, interfaceName: string): string => {
    const properties = Object.entries(obj)
      .map(([key, value]) => {
        const type = getTypeString(value, interfaceName.slice(1), key);
        const propertyName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : `'${key}'`;
        // 添加JSDoc注释
        const comment =
          typeof value === 'object' && value !== null
            ? `\n  /** ${type} 类型的对象 */\n  `
            : '';
        return `${comment}${propertyName}: ${type};`;
      })
      .join('\n  ');

    return `{\n  ${properties}\n}`;
  };

  // 生成根接口
  const rootInterface = generateInterface(obj, rootName);
  interfaces[rootName] = rootInterface;

  // 生成最终的类型定义字符串
  return Object.entries(interfaces)
    .map(([name, content]) => `interface ${name} ${content}`)
    .join('\n\n');
}

@Injectable()
export class TranslateService {
  async translate(body: TranslateDto) {
    const { method = 'get', params = {}, type = 'query', url } = body;

    let newUrl = url;
    if (type === 'query') {
      // 将params参数拼接到url上
      const queryParams = new URLSearchParams(params).toString();
      newUrl += '?' + queryParams;
    }

    let data;

    try {
      const requestData = await axios({
        method,
        url: newUrl,
        data: params,
        headers: {
          server: true,
        },
      });
      data = requestData.data;
    } catch {
      Logger.error('错误');
    }
    if (!data) {
      throw new NotFoundException('接口找不到或者请求失败');
    }

    const ts = jsonToTs(data);

    return {
      data: ts,
    };
  }
}
