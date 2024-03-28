import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
// upstash.com
import Redis from "ioredis"

const client = new Redis("rediss://default:e37c5efc9d424fa0bb1eef1a6e7d9dbd@apn1-renewing-silkworm-33848.upstash.io:33848");
// await client.set('foo', 'bar');
// await client.set('foo1', 'bbbb');
// await client.set('foo2', JSON.stringify({
//   name: 'vkb',
//   info: {
//     gender: 'male',
//     age: 121
//   }
// }));

const x = await client.get('foo2');
console.log('x', x)



export const meta: MetaFunction = () => {
  return [
    { title: "Screen Resolution Collection" },
  ];
};

export default function Index() {

  useEffect(() => {
    const { width, height } = window.screen;
    console.log('xx', { width, height })
  }, []);
  return (
    <div>111</div>
  );
}
