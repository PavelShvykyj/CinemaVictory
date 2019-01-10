import {Pipe, PipeTransform } from '@angular/core'
import { IdataObject } from '../../HallBrowser/idata-object'

@Pipe({
    name: 'mapToIterable'
})
export class MapToIterable implements PipeTransform {
    transform(map : IdataObject , args? : any  ) {
        if (!map) {
            return []
        }
        /// глобальный объект Object имеет статик метод keys - возвращает массив свойств переданного екземпляра 
        /// массив имеет статик метод map - возвращает преобразованный массив применив переданную функцию к элементам
        return Object.keys(map).map((key) => ({'key' : key, 'value' : map[key]}));
    } 
}