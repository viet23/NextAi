import { GenderEnum } from "src/enums/gender.enum";
import RenderIf from "../RenderIf";
import { Typography } from "antd";
const { Text } = Typography;
interface GenderProps {
  gender: GenderEnum;
}
const Gender: React.FC<GenderProps> = ({ gender }) => {
  return (
    <>
      <RenderIf condition={gender == GenderEnum.FEMALE}>
        <Text>Nữ</Text>
      </RenderIf>
      <RenderIf condition={gender == GenderEnum.MALE}>
        <Text>Nam</Text>
      </RenderIf>
      <RenderIf condition={gender == GenderEnum.UNKNOWN}>
        <Text>Không xác định</Text>
      </RenderIf>
    </>
  );
};
export default Gender;
