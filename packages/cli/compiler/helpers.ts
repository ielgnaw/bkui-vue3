/*
* Tencent is pleased to support the open source community by making
* 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
*
* Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
*
* 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) is licensed under the MIT License.
*
* License for 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition):
*
* ---------------------------------------------------
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
* to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of
* the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
* THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
* CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
* IN THE SOFTWARE.
*/
import { appendFile, createReadStream, createWriteStream, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, parse, resolve } from 'path';
import { promisify } from 'util';

import { ITaskItem } from '../typings/task';

export const BKUI_DIR = resolve(__dirname, '../../../');
export const PACKAGES_URL = resolve(BKUI_DIR, './packages');
export const COMPONENT_URL = resolve(BKUI_DIR, './packages/bkui-vue');
export const DIST_URL =  resolve(BKUI_DIR, './dist');
export const LIB_URL =  resolve(BKUI_DIR, './lib');
export const THEME_LESS_URL = resolve(COMPONENT_URL, 'styles/src/themes/themes.less');


// 编译转换*.d.ts
export const compilerLibDir = async (dir: string): Promise<any> => {
  const buildDir: any = (dir: string) => {
    const files = readdirSync(dir);
    const list = files.filter(url =>  /\.d.ts$/.test(join(dir, url)));
    (list.length ? list : files).forEach((file, index) => {
      const url = join(dir, file);
      if (list.length) {
        if (/lib\/(bkui-vue|styles\/src)\/(components|index)\.d\.ts$/.test(url)) {
          let chunck = readFileSync(url, 'utf-8');
          chunck = chunck.replace(/@bkui-vue/gmi, url.match(/styles\/src\/index.d.ts$/) ? '..' : '.');
          writeFileSync(url, chunck);
        }
        moveFile(url, resolve(parse(url).dir, '../', parse(url).base))
          .then(() => {
            if (index === list.length - 1) {
              rmdirSync(parse(url).dir, { recursive: true });
            }
          })
          .catch(console.error);
      } else if (lstatSync(url).isDirectory()) {
        buildDir(url);
      }
    });
  };
  buildDir(dir);
};

// move file
export const moveFile = (oldPath: string, newPath: string) => new Promise((resolve, reject) => {
  const readStream = createReadStream(oldPath);
  const writeStream = createWriteStream(newPath);
  readStream.on('error', err => reject(err));
  writeStream.on('error', err => reject(err));
  writeStream.on('close', () => {
    resolve(undefined);
  });
  readStream.pipe(writeStream);
});

export const compileFile = (url: string): ITaskItem | undefined => {
  if (/\/dist\/|\.DS_Store|\.bak/.test(url)) {
    return;
  }
  const newPath = url.replace(new RegExp(`${COMPONENT_URL}/([^/]+)/src`), `${LIB_URL}/$1`);
  const isMain = /\/bkui-vue\/.*\.ts$/.test(url);
  if (/\.(css|less|scss)$/.test(url) && !/\.variable.(css|less|scss)$/.test(url)) {
    return {
      type: 'style',
      url,
      newPath,
    };
  } if (/\/src\/index\.(js|ts|jsx|tsx)$/.test(url) || isMain) {
    if (isMain) {
      return {
        type: 'script',
        url,
        newPath: LIB_URL,
      };
    }
    return {
      type: 'script',
      url,
      newPath,
    };
  }
  if (/\/icon\/icons\/[^.]+\.(js|ts|jsx|tsx)$/.test(url)) {
    return {
      type: 'script',
      url,
      newPath: url.replace(new RegExp(`${COMPONENT_URL}/([^/]+)/icons`), `${LIB_URL}/$1`),
    };
  }

  return;
};
export const writeFileRecursive = async (url: string, content: string) => {
  let filepath = url.replace(/\\/g, '/');
  let root = '';
  if (filepath[0] === '/') {
    root = '/';
    filepath = filepath.slice(1);
  } else if (filepath[1] === ':') {
    root = filepath.slice(0, 3);   // c:\
    filepath = filepath.slice(3);
  }

  const folders = filepath.split('/').slice(0, -1);  // remove last item, file
  folders.reduce(
    (acc, folder) => {
      const folderPath = `${acc + folder}/`;
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath);
      }
      return folderPath;
    },
    root,
  );
  if (existsSync(url)) unlinkSync(url);
  await promisify(appendFile)(url, content, 'utf-8');
};
