import { Vec } from "@/app/types";

export class vec {
    static add(a: Vec, b: Vec): Vec {
        return {x: a.x + b.x, y: a.y + b.y};
    }

    static scaleAdd(a: Vec, b: Vec, s: number): Vec {
        return {x: a.x + b.x * s, y: a.y + b.y * s};
    }

    static sum(...vectors: Vec[]): Vec {
        const result: Vec = {x: 0, y: 0};

        for (const v of vectors) {
            result.x += v.x;
            result.y += v.y;
        }

        return result;
    }

    static sub(a: Vec, b: Vec): Vec {
        return {x: a.x - b.x, y: a.y - b.y};
    }

    static mul(a: Vec, b: Vec): Vec {
        return {x: a.x * b.x, y: a.y * b.y};
    }

    static len(v: Vec): number {
        return (v.x * v.x + v.y * v.y) ** 0.5;
    }

    static distance(a: Vec, b: Vec): number {
        return vec.len(vec.sub(a, b));
    }

    static dot(a: Vec, b: Vec): number {
        return (a.x * b.x + a.y * b.y) / (vec.len(a) * vec.len(b));
    }

    static normalize(v: Vec): Vec {
        const len = vec.len(v);

        return {x: v.x / len, y: v.y};
    }

    static abs(v: Vec): Vec {
        return {x: Math.abs(v.x), y: Math.abs(v.y)};
    }
}