import { PageDto } from '@/common/pagination/page.dto'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

export const paginateArrays = (arrayItems: any[], params: PageOptionsDto) => {
  const paginateResult = arrayItems.slice((params.page - 1) * params.num, params.page * params.num)
  return new PageDto(
    params?.allPage ? arrayItems : paginateResult,
    new PageMetaDto({
      pageOptionsDto: params,
      itemCount: arrayItems.length,
    })
  )
}
