import { Controller, Get, Route, SuccessResponse, Tags } from 'tsoa'

@Route('healthcheck')
@Tags('Info')
export class HealthcheckController extends Controller {
  @Get()
  @SuccessResponse(204)
  get(): void {}
}
