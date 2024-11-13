import { type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from 'react';

import check from './svg/check.svg';
import copy from './svg/copy.svg';
import github from './svg/github.svg';

const IconList = { check, copy, github };

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ComponentAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
interface IconProps extends ComponentAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}

export type Icon = ForwardRefExoticComponent<IconProps>;

export const Icons = IconList as Record<keyof typeof IconList, Icon>;
